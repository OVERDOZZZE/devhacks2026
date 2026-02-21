"""
agent/service.py

Two service functions covering the full interview lifecycle:

  1. generate_and_save_questions  – called when the interview is started
  2. evaluate_and_save_all        – called when the interview is completed;
                                    receives all answers at once, scores each
                                    Q&A, and computes the overall result in a
                                    single LLM call.
"""

import logging

from src.interview.models import Interview, InterviewQA, Question

from .client import call_llm
from .parsers import parse_json_response, parse_questions
from .prompts import build_full_evaluation_messages, build_question_generation_messages

logger = logging.getLogger(__name__)


def generate_and_save_questions(interview: Interview) -> list[InterviewQA]:
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

    logger.info("Generated %d questions for Interview #%d.", len(qa_pairs), interview.pk)
    return qa_pairs


def evaluate_and_save_all(
    interview: Interview,
    answers: list[dict], 
) -> Interview:

    agent = interview.agent
    if agent is None:
        raise ValueError(f"Interview #{interview.pk} has no agent assigned.")

    answer_map: dict[int, str] = {item["qa_id"]: item["answer"] for item in answers}

    qa_rows = (
        interview.qa_pairs
        .select_related("question")
        .order_by("order")
    )

    updated_qa: list[InterviewQA] = []
    for qa in qa_rows:
        answer_text = answer_map.get(qa.pk, "")
        qa.answer = answer_text
        qa.save(update_fields=["answer"])
        updated_qa.append(qa)

    qa_payload = [
        {
            "qa_id": qa.pk,
            "question": qa.question.text,
            "answer": qa.answer or "",
        }
        for qa in updated_qa
    ]

    messages = build_full_evaluation_messages(
        agent_prompt=agent.prompt,
        qa_pairs=qa_payload,
    )

    raw = call_llm(messages)
    data = parse_json_response(raw)

    evaluations: list[dict] = data.get("evaluations", [])
    eval_map: dict[int, dict] = {e["qa_id"]: e for e in evaluations}

    for qa in updated_qa:
        eval_entry = eval_map.get(qa.pk)
        if not eval_entry:
            logger.warning("No evaluation returned for QA #%d.", qa.pk)
            continue

        score = int(eval_entry.get("score", 0))
        qa.score = max(1, min(10, score))
        qa.feedback = str(eval_entry.get("feedback", ""))
        qa.save(update_fields=["score", "feedback"])

    overall_score = int(data.get("overall_score", 0))
    interview.overall_score = max(1, min(10, overall_score))
    interview.overall_feedback = str(data.get("overall_feedback", ""))
    interview.save(update_fields=["overall_score", "overall_feedback"])

    logger.info(
        "Evaluated Interview #%d — overall score: %d/10.",
        interview.pk,
        interview.overall_score,
    )
    return interview
