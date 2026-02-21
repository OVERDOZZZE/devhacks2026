import logging

from src.interview.models import Interview, InterviewQA, Question

from .client import call_llm
from .parsers import parse_json_response, parse_questions
from .prompts import (
    build_answer_scoring_messages,
    build_overall_feedback_messages,
    build_question_generation_messages,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Step 1 – Question generation
# ---------------------------------------------------------------------------

def generate_and_save_questions(interview: Interview) -> list[InterviewQA]:
    """
    Ask the LLM to generate questions for *interview*, then persist them.

    Creates one Question object and one InterviewQA row per question.
    Returns the list of created InterviewQA instances.

    Raises RuntimeError (from client.call_llm) on LLM failure.
    """
    agent = interview.agent
    if agent is None:
        raise ValueError(f"Interview #{interview.pk} has no agent assigned.")

    messages = build_question_generation_messages(
        agent_prompt=agent.prompt,
        job_description=interview.job_description,
        number_of_questions=interview.number_of_questions,
    )

    raw = call_llm(messages)
    question_texts = parse_questions(raw)

    if not question_texts:
        raise RuntimeError("LLM returned no parseable questions.")

    # Trim/pad to exact count requested (LLMs sometimes return slightly more/less)
    question_texts = question_texts[: interview.number_of_questions]

    qa_pairs: list[InterviewQA] = []
    for order, text in enumerate(question_texts, start=1):
        question, _ = Question.objects.get_or_create(text=text)
        qa = InterviewQA.objects.create(
            interview=interview,
            question=question,
            order=order,
        )
        qa_pairs.append(qa)

    logger.info(
        "Generated %d questions for Interview #%d.", len(qa_pairs), interview.pk
    )
    return qa_pairs


# ---------------------------------------------------------------------------
# Step 2 – Answer scoring
# ---------------------------------------------------------------------------

def score_and_save_answer(qa: InterviewQA) -> InterviewQA:
    """
    Ask the LLM to score *qa.answer* and persist the result.

    Expects qa.answer to already be set.
    Updates qa.score and qa.feedback in-place and saves.

    Raises RuntimeError on LLM failure; ValueError on unparseable JSON.
    """
    interview = qa.interview
    agent = interview.agent
    if agent is None:
        raise ValueError(f"Interview #{interview.pk} has no agent assigned.")

    if not qa.answer:
        logger.warning("QA #%d has no answer; skipping scoring.", qa.pk)
        return qa

    messages = build_answer_scoring_messages(
        agent_prompt=agent.prompt,
        question_text=qa.question.text,
        answer_text=qa.answer,
    )

    raw = call_llm(messages)
    data = parse_json_response(raw)

    score = int(data.get("score", 0))
    feedback = str(data.get("feedback", ""))

    qa.score = max(1, min(10, score))  # clamp to 1–10
    qa.feedback = feedback
    qa.save(update_fields=["score", "feedback"])

    logger.info("Scored QA #%d: %d/10.", qa.pk, qa.score)
    return qa


# ---------------------------------------------------------------------------
# Step 3 – Overall interview evaluation
# ---------------------------------------------------------------------------

def compute_and_save_overall(interview: Interview) -> Interview:
    """
    Ask the LLM to produce an overall score and feedback for *interview*.

    Reads all InterviewQA pairs belonging to the interview, sends them to
    the LLM, and saves overall_score + overall_feedback on the interview.

    Raises RuntimeError on LLM failure; ValueError on unparseable JSON.
    """
    agent = interview.agent
    if agent is None:
        raise ValueError(f"Interview #{interview.pk} has no agent assigned.")

    qa_pairs_qs = interview.qa_pairs.select_related("question").all()
    qa_payload = [
        {
            "question": qa.question.text,
            "answer": qa.answer or "",
            "score": qa.score,
            "feedback": qa.feedback or "",
        }
        for qa in qa_pairs_qs
    ]

    messages = build_overall_feedback_messages(
        agent_prompt=agent.prompt,
        qa_pairs=qa_payload,
    )

    raw = call_llm(messages)
    data = parse_json_response(raw)

    overall_score = int(data.get("overall_score", 0))
    overall_feedback = str(data.get("overall_feedback", ""))

    interview.overall_score = max(1, min(10, overall_score))
    interview.overall_feedback = overall_feedback
    interview.save(update_fields=["overall_score", "overall_feedback"])

    logger.info(
        "Overall score for Interview #%d: %d/10.", interview.pk, interview.overall_score
    )
    return interview
