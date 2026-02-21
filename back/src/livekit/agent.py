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

SILENCE_TIMEOUT = 5.0   # seconds of silence before answer is considered done
SILENCE_CHECK_INTERVAL = 0.2


class InterviewAgent(Agent):
    def __init__(self, questions, room):
        super().__init__(
            instructions=(
                "You are a professional interview assistant. "
                "You will be given explicit instructions for each action to take. "
                "Only do exactly what you are instructed — do not ask follow-up questions, "
                "do not continue the conversation on your own, and do not speak unless instructed."
            )
        )
        self.questions = questions
        self.answers = {}
        self.room = room

    async def _wait_for_answer(self, message_count_before: int) -> str:
        """
        Fix #3: Real silence-based end-of-speech detection.
        Waits until the VAD reports the user has stopped speaking for
        SILENCE_TIMEOUT seconds, then grabs everything said since
        message_count_before as the answer.
        """
        silence_elapsed = 0.0

        while silence_elapsed < SILENCE_TIMEOUT:
            await asyncio.sleep(SILENCE_CHECK_INTERVAL)

            vad_state = self.session.input.audio.vad_state if self.session.input.audio else None

            if vad_state is not None and vad_state.speech_probability > 0.5:
                # Candidate is still talking — reset the silence counter
                silence_elapsed = 0.0
            else:
                silence_elapsed += SILENCE_CHECK_INTERVAL

        # Fix #2: only look at messages added after this question was asked
        messages = self.session.history.messages()
        new_user_messages = [
            m for m in messages[message_count_before:]
            if m.role == "user"
        ]
        return new_user_messages[-1].content if new_user_messages else ""

    async def on_enter(self):
        await asyncio.sleep(1)

        for i, qa in enumerate(self.questions):
            qa_id = qa["qa_id"]
            question_text = qa["question"]

            await self.room.local_participant.publish_data(
                json.dumps({"type": "question_index", "index": i}).encode(),
                topic="interview"
            )

            # Snapshot history length before asking so we can isolate the answer
            message_count_before = len(self.session.history.messages())

            await self.session.generate_reply(
                instructions=f"Ask the candidate this exact question: {question_text}"
            )

            await self.room.local_participant.publish_data(
                json.dumps({"type": "question_asked"}).encode(),
                topic="interview"
            )

            answer = await self._wait_for_answer(message_count_before)
            self.answers[qa_id] = answer

            await self.room.local_participant.publish_data(
                json.dumps({"type": "answer_captured", "qa_id": qa_id, "answer": answer}).encode(),
                topic="interview"
            )

            if i < len(self.questions) - 1:
                await self.session.generate_reply(
                    instructions=(
                        "Give the candidate one short sentence of feedback on their answer. "
                        "Then say you are moving to the next question. Keep it under 20 words total."
                    )
                )
            else:
                await self.session.generate_reply(
                    instructions=(
                        "Give the candidate one short sentence of feedback on their final answer. "
                        "Then thank them briefly and say the interview is now complete. "
                        "Keep it under 30 words total."
                    )
                )
                await asyncio.sleep(3)
                await self.room.local_participant.publish_data(
                    json.dumps({
                        "type": "interview_complete",
                        "answers": [{"qa_id": k, "answer": v} for k, v in self.answers.items()]
                    }).encode(),
                    topic="interview"
                )

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    questions = json.loads(ctx.room.metadata or "[]")

    if not questions:
        logger.warning("No questions in room metadata.")
        return

    agent = InterviewAgent(questions=questions, room=ctx.room)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(),
        tts=openai.TTS(),
    )

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))