def build_question_generation_messages(
    agent_prompt: str,
    job_description: str | None,
    number_of_questions: int,
) -> list[dict]:
    """
    Build the messages list to send to the LLM for question generation.

    The agent_prompt is the system-level persona/instructions defined by the Agent model.
    The user message instructs the model to produce exactly N questions as a numbered list.
    """
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


def build_answer_scoring_messages(
    agent_prompt: str,
    question_text: str,
    answer_text: str,
) -> list[dict]:
    """
    Build the messages list to send to the LLM for scoring a single answer.

    Returns a prompt that instructs the model to reply with JSON containing:
      { "score": <int 1-10>, "feedback": "<string>" }
    """
    system_content = agent_prompt.strip()

    user_content = (
        f"You are evaluating a candidate's answer during a mock interview.\n\n"
        f"Question: {question_text.strip()}\n\n"
        f"Candidate's answer: {answer_text.strip()}\n\n"
        "Evaluate the answer and respond with ONLY valid JSON in this exact format:\n"
        '{ "score": <integer from 1 to 10>, "feedback": "<one or two sentence feedback>" }\n'
        "Do not include any other text."
    )

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": user_content},
    ]


def build_overall_feedback_messages(
    agent_prompt: str,
    qa_pairs: list[dict],
) -> list[dict]:
    """
    Build the messages list for computing overall interview score and feedback.

    qa_pairs: list of {"question": str, "answer": str, "score": int, "feedback": str}

    Instructs the model to reply with JSON:
      { "overall_score": <int 1-10>, "overall_feedback": "<paragraph>" }
    """
    system_content = agent_prompt.strip()

    lines = ["Here is a summary of all Q&A pairs from the interview:\n"]
    for i, qa in enumerate(qa_pairs, start=1):
        lines.append(
            f"{i}. Question: {qa['question']}\n"
            f"   Answer: {qa.get('answer') or '(no answer)'}\n"
            f"   Score: {qa.get('score', 'N/A')}/10\n"
            f"   Feedback: {qa.get('feedback', 'N/A')}\n"
        )

    lines += [
        "Based on all of the above, provide an overall assessment.",
        "Respond with ONLY valid JSON in this exact format:",
        '{ "overall_score": <integer from 1 to 10>, "overall_feedback": "<two to four sentence summary>" }',
        "Do not include any other text.",
    ]

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": "\n".join(lines)},
    ]
