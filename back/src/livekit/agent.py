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
from livekit.plugins import openai, silero

logger = logging.getLogger("interview-agent")


class InterviewAgent(Agent):
    def __init__(self, questions, room):
        super().__init__(
            instructions=(
                "You are a professional interview assistant conducting a mock interview. "
                "Ask the candidate the questions one by one. "
                "After they answer, move to the next question. "
                "Be calm, professional and encouraging."
            )
        )
        self.questions = questions
        self.answers = {}
        self.room = room 

    async def on_enter(self):
        await asyncio.sleep(1)

        for i, qa in enumerate(self.questions):
            qa_id = qa["qa_id"]
            question_text = qa["question"]

            await self.room.local_participant.publish_data(
                json.dumps({"type": "question_index", "index": i}).encode(),
                topic="interview"
            )

            await self.session.generate_reply(
                instructions=f"Ask the candidate this exact question: {question_text}"
            )

            await asyncio.sleep(20)

            messages = self.session.history.messages
            user_messages = [m for m in messages if m.role == "user"]
            answer = user_messages[-1].content if user_messages else ""
            self.answers[qa_id] = answer

            await self.room.local_participant.publish_data(
                json.dumps({"type": "answer_captured", "qa_id": qa_id, "answer": answer}).encode(),
                topic="interview"
            )

            if i < len(self.questions) - 1:
                await asyncio.sleep(1)

        await self.session.generate_reply(
            instructions="Tell the candidate the interview is complete and thank them."
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

    from livekit.agents import AgentSession
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
