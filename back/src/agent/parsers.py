import json
import re
import logging

logger = logging.getLogger(__name__)


def parse_questions(raw_text: str) -> list[str]:
    """
    Parse a numbered list of questions from the LLM's raw output.

    Handles formats like:
      1. What is ...?
      1) What is ...?
    
    Returns a list of question strings (stripped, without the numbering prefix).
    """
    lines = raw_text.strip().splitlines()
    questions = []

    for line in lines:
        line = line.strip()
        # Match lines starting with a number followed by . or )
        match = re.match(r"^\d+[.)]\s*(.+)", line)
        if match:
            questions.append(match.group(1).strip())

    if not questions:
        logger.warning("Could not parse any questions from LLM output:\n%s", raw_text)

    return questions


def parse_json_response(raw_text: str) -> dict:
    """
    Extract and parse a JSON object from the LLM's raw output.

    Handles cases where the model wraps JSON in markdown code fences.
    
    Returns a dict. Raises ValueError if no valid JSON is found.
    """
    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?\s*", "", raw_text).replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find a JSON object substring
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

    logger.error("Failed to parse JSON from LLM output:\n%s", raw_text)
    raise ValueError(f"Could not extract valid JSON from LLM response: {raw_text!r}")
