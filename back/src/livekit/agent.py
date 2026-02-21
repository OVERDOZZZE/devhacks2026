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

# Minimum seconds to wait before accepting an answer.
# Prevents the agent from capturing its own TTS echo as the answer.
MIN_ANSWER_WAIT = 3.0

# Maximum seconds to wait for the user to start answering.
ANSWER_TIMEOUT = 90.0

# How long the user must be silent after their last transcript
# before we consider the answer complete.
SILENCE_THRESHOLD = 2.5


class InterviewAgent(Agent):
    def __init__(self, questions: list[dict], room):
        super().__init__(
            # Instruct the LLM to never speak on its own initiative.
            # Even though we bypass it for all spoken output, AgentSession
            # may still invoke it internally — this is a safety net.
            instructions=(
                "You are silent. You must NEVER speak, NEVER generate questions, "
                "and NEVER respond to anything the user says. Stay completely silent."
            )
        )
        self.questions = questions
        self.answers: dict[int, str] = {}
        self.room = room

        # Accumulates all transcript segments for the current question.
        self._transcript_parts: list[str] = []
        # Fired each time a new final transcript segment arrives.
        # _collect_answer resets and re-waits this after each segment.
        self._transcript_event: asyncio.Event = asyncio.Event()
        # Whether we are currently inside _collect_answer's listening window.
        # The listener ignores transcripts outside this window (e.g. during TTS).
        self._listening: bool = False

    # ------------------------------------------------------------------
    # STT listener — attached once for the whole session lifetime
    # ------------------------------------------------------------------

    def _on_transcript(self, event) -> None:
        """
        Called by AgentSession whenever a final user transcript is ready.
        Appends to the running transcript and signals the collect loop.
        Ignored if we're not in a listening window (e.g. during TTS playback).
        """
        if not self._listening:
            return
        if not getattr(event, "is_final", True):
            return

        text = (getattr(event, "transcript", "") or "").strip()
        if not text:
            return

        logger.debug("Transcript segment: %r", text)
        self._transcript_parts.append(text)
        self._transcript_event.set()

    # ------------------------------------------------------------------
    # Per-question answer collection
    # ------------------------------------------------------------------

    async def _collect_answer(self) -> str:
        """
        Wait for the user to fully finish answering a question.

        Strategy:
        1. Unconditional MIN_ANSWER_WAIT sleep so TTS audio clears the STT
           pipeline before we start listening (prevents the agent's own voice
           being captured as an answer).
        2. Open the listening window and wait up to ANSWER_TIMEOUT for the
           user to start speaking.
        3. After each transcript segment, reset a SILENCE_THRESHOLD timer.
           If a new segment arrives before the timer expires, restart it.
           Only when the user has been silent for the full SILENCE_THRESHOLD
           do we consider the answer complete.
        4. Concatenate all segments and return the full answer.
        """
        # Reset state for this question
        self._transcript_parts = []
        self._transcript_event.clear()

        # Step 1: wait for TTS to finish playing before we start listening.
        # This prevents the microphone echo of the agent's own voice being
        # picked up by STT and treated as the candidate's answer.
        await asyncio.sleep(MIN_ANSWER_WAIT)

        # Step 2: open the listening window
        self._listening = True

        try:
            # Wait for the first segment — bail if they never say anything
            try:
                await asyncio.wait_for(self._transcript_event.wait(), timeout=ANSWER_TIMEOUT)
            except asyncio.TimeoutError:
                logger.warning("No answer received within timeout — moving on.")
                return ""

            # Step 3: keep resetting the silence timer after each new segment
            while True:
                self._transcript_event.clear()
                try:
                    await asyncio.wait_for(
                        self._transcript_event.wait(),
                        timeout=SILENCE_THRESHOLD,
                    )
                    # A new segment arrived before the silence window closed — loop again
                except asyncio.TimeoutError:
                    # Silence window elapsed with no new segment — answer is complete
                    break

        finally:
            self._listening = False

        # Step 4: join all captured segments into one answer string
        full_answer = " ".join(self._transcript_parts).strip()
        logger.debug("Full answer collected: %r", full_answer)
        return full_answer

    # ------------------------------------------------------------------
    # Main interview loop
    # ------------------------------------------------------------------

    async def on_enter(self) -> None:
        # Give the room a moment to settle before we start speaking
        await asyncio.sleep(1.5)

        # Attach the transcript listener once, for the whole session
        self.session.on("user_input_transcribed", self._on_transcript)

        try:
            for i, qa in enumerate(self.questions):
                qa_id = qa["qa_id"]
                question_text = qa["question"]
                is_last = i == len(self.questions) - 1

                logger.info("Question %d/%d (qa_id=%d)", i + 1, len(self.questions), qa_id)

                # Tell the frontend which question is active
                await self._publish({"type": "question_index", "index": i})

                # Speak the question — say() goes straight to TTS, skips LLM
                await self.session.say(question_text, allow_interruptions=False)

                # Tell the frontend the agent has finished speaking
                await self._publish({"type": "question_asked"})

                # Collect the candidate's spoken answer
                answer = await self._collect_answer()
                self.answers[qa_id] = answer

                logger.info("Answer captured for qa_id=%d: %r", qa_id, answer)

                # Send the captured answer to the frontend
                await self._publish({
                    "type": "answer_captured",
                    "qa_id": qa_id,
                    "answer": answer,
                })

                if not is_last:
                    # Brief scripted bridge — no LLM, no improvisation
                    await self.session.say("Moving to the next question.", allow_interruptions=False)
                else:
                    await self.session.say(
                        "Thank you. The interview is now complete.",
                        allow_interruptions=False,
                    )
                    # Short pause so the TTS finishes before we disconnect
                    await asyncio.sleep(3)
                    await self._publish({
                        "type": "interview_complete",
                        "answers": [
                            {"qa_id": k, "answer": v}
                            for k, v in self.answers.items()
                        ],
                    })
        finally:
            # Always detach the listener — even if we crash mid-interview
            self.session.off("user_input_transcribed", self._on_transcript)

    # ------------------------------------------------------------------
    # Helper
    # ------------------------------------------------------------------

    async def _publish(self, payload: dict) -> None:
        """Publish a JSON message to the 'interview' data channel."""
        try:
            await self.room.local_participant.publish_data(
                json.dumps(payload).encode(),
                topic="interview",
            )
        except Exception:
            logger.exception("Failed to publish data: %r", payload)


# ----------------------------------------------------------------------
# LiveKit entrypoint
# ----------------------------------------------------------------------

async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    raw_metadata = ctx.room.metadata or "{}"
    try:
        metadata = json.loads(raw_metadata)
    except json.JSONDecodeError:
        logger.warning("Could not parse room metadata — using defaults.")
        metadata = {}

    questions: list[dict] = metadata.get("questions", [])
    voice: str = metadata.get("voice", "alloy")

    if not questions:
        logger.error("No questions in room metadata — aborting job.")
        return

    if voice not in VALID_VOICES:
        logger.warning("Unknown voice %r — falling back to 'alloy'.", voice)
        voice = "alloy"

    logger.info("Starting interview: voice=%r, %d question(s).", voice, len(questions))

    agent = InterviewAgent(questions=questions, room=ctx.room)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        # LLM is required by AgentSession but we instruct it to stay silent.
        # It will never be triggered because we never call generate_reply().
        llm=openai.LLM(temperature=0),
        tts=openai.TTS(voice=voice),
        # Disable automatic turn-taking so the LLM never auto-fires
        # after VAD detects the user has stopped speaking.
        allow_interruptions=False,
    )

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))