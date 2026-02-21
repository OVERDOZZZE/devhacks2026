
def build_question_generation_messages(
    agent_prompt: str,
    job_description: str | None,
    number_of_questions: int,
) -> list[dict]:
    system_content = agent_prompt.strip()

    user_lines = [
        f"Generate exactly {number_of_questions} interview questions.",
    ]

    if job_description:
        user_lines.append(
            f"\nHere is the job description to tailor the questions to:\n{job_description.strip()}"
        )

    user_lines += [
        "\nRules:",
        "- Return ONLY a numbered list (1. ... 2. ... etc.), one question per line.",
        "- Do NOT add any introduction, explanation, or closing remarks.",
        "- Each question must be a single, complete sentence ending with a question mark.",
    ]

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": "\n".join(user_lines)},
    ]


def build_full_evaluation_messages(
    agent_prompt: str,
    qa_pairs: list[dict],
) -> list[dict]:
    
    system_content = agent_prompt.strip()

    lines = [
        "You are evaluating a candidate's performance in a mock interview.",
        "Below are all the questions and the candidate's answers.\n",
    ]

    for qa in qa_pairs:
        lines.append(f"[ID: {qa['qa_id']}]")
        lines.append(f"Question: {qa['question']}")
        lines.append(f"Answer: {qa.get('answer') or '(no answer given)'}")
        lines.append("")

    lines += [
        "For each question-answer pair, provide a score (1-10) and one or two sentences of feedback.",
        "Then provide an overall score (1-10) and a short overall feedback paragraph (2-4 sentences) "
        "summarising the candidate's strengths and areas for improvement.",
        "",
        "Respond with ONLY valid JSON in exactly this format (no extra text, no markdown fences):",
        '{',
        '  "evaluations": [',
        '    {"qa_id": <id>, "score": <1-10>, "feedback": "<string>"},',
        '    ...',
        '  ],',
        '  "overall_score": <1-10>,',
        '  "overall_feedback": "<string>"',
        '}',
    ]

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": "\n".join(lines)},
    ]
