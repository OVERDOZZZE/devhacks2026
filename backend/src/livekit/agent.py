import asyncio
import json
import logging
import os

from decouple import config

os.environ.setdefault("LIVEKIT_URL", config("LIVEKIT_URL"))
os.environ.setdefault("LIVEKIT_API_KEY", config("LIVEKIT_API_KEY"))
os.environ.setdefault("LIVEKIT_API_SECRET", config("LIVEKIT_API_SECRET"))
os.environ.setdefault("OPENAI_API_KEY", config("OPENAI_API_KEY"))

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, Agent, RoomInputOptions
from livekit.agents import AgentSession
from livekit.plugins import openai, silero

logger = logging.getLogger("interview-agent")

VALID_VOICES = {"alloy", "echo", "fable", "onyx", "nova", "shimmer"}


class InterviewAgent(Agent):
    def __init__(self, questions, room):
        super().__init__(
            instructions=(
                "You are a professional interview assistant conducting a structured interview. "
                "The interview questions are pre-written and will be provided to you explicitly. "
                "NEVER generate your own questions. NEVER deviate from explicit instructions. "
                "Only speak when instructed, say exactly what is instructed, nothing more."
            )
        )
        self.questions = questions
        self.answers   = {}
        self.room      = room

    async def _wait_for_answer(self, message_count_before: int, min_wait: float = 5.0) -> str:
        answer_event = asyncio.Event()
        captured = {"text": ""}

        def on_transcript(event):
            if getattr(event, "is_final", True):
                captured["text"] = getattr(event, "transcript", "") or ""
                answer_event.set()

        self.session.on("user_input_transcribed", on_transcript)

        try:
            await asyncio.gather(
                asyncio.sleep(min_wait),
                asyncio.wait_for(answer_event.wait(), timeout=60.0),
            )
        except asyncio.TimeoutError:
            pass
        finally:
            self.session.off("user_input_transcribed", on_transcript)

        if not captured["text"]:
            messages = self.session.history.messages()
            new_user_messages = [
                m for m in messages[message_count_before:]
                if m.role == "user"
            ]
            captured["text"] = new_user_messages[-1].content if new_user_messages else ""

        return captured["text"]
    
    async def on_enter(self):
        await asyncio.sleep(1)

        for i, qa in enumerate(self.questions):
            qa_id         = qa["qa_id"]
            question_text = qa["question"]

            await self.room.local_participant.publish_data(
                json.dumps({"type": "question_index", "index": i}).encode(),
                topic="interview",
            )

            message_count_before = len(self.session.history.messages())

            await self.session.say(question_text, allow_interruptions=False)

            await self.room.local_participant.publish_data(
                json.dumps({"type": "question_asked"}).encode(),
                topic="interview",
            )

            answer = await self._wait_for_answer(message_count_before)
            self.answers[qa_id] = answer

            await self.room.local_participant.publish_data(
                json.dumps({"type": "answer_captured", "qa_id": qa_id, "answer": answer}).encode(),
                topic="interview",
            )

            is_last = i == len(self.questions) - 1

            if not is_last:
                await self.session.say("Thank you. Moving to the next question.", allow_interruptions=False)
            else:
                await self.session.say("Thank you. The interview is now complete.", allow_interruptions=False)
                await asyncio.sleep(3)
                await self.room.local_participant.publish_data(
                    json.dumps({
                        "type": "interview_complete",
                        "answers": [{"qa_id": k, "answer": v} for k, v in self.answers.items()],
                    }).encode(),
                    topic="interview",
                )

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    raw_metadata = ctx.room.metadata or "{}"
    try:
        metadata = json.loads(raw_metadata)
    except json.JSONDecodeError:
        logger.warning("Could not parse room metadata as JSON; falling back to defaults.")
        metadata = {}

    questions = metadata.get("questions", [])
    voice     = metadata.get("voice", "alloy")

    if not questions:
        logger.warning("No questions found in room metadata — aborting.")
        return

    if voice not in VALID_VOICES:
        logger.warning("Unknown TTS voice %r — falling back to 'alloy'.", voice)
        voice = "alloy"

    logger.info("Starting interview with voice=%r, %d questions.", voice, len(questions))

    agent = InterviewAgent(questions=questions, room=ctx.room)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(temperature=0),
        tts=openai.TTS(voice=voice),
        # Disable automatic replies — we drive everything manually in on_enter
        allow_interruptions=False,
    )

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
    