import logging
import pdfplumber
import io

from src.agent.client import call_llm
from src.agent.parsers import parse_json_response
from .cv_prompts import build_cv_analysis_messages

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF file using pdfplumber."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
    return "\n\n".join(text_parts)


def analyse_cv(file_bytes: bytes, filename: str) -> dict:
    """
    Extract text from CV file, send to LLM, parse and return structured analysis.
    Supports PDF and plain text files.
    """
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        cv_text = extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith((".txt", ".md")):
        cv_text = file_bytes.decode("utf-8", errors="replace")
    else:
        # Attempt UTF-8 decode as fallback (e.g. .doc plain text)
        cv_text = file_bytes.decode("utf-8", errors="replace")

    if not cv_text.strip():
        raise ValueError("Could not extract any text from the uploaded file. Please upload a readable PDF or text file.")

    if len(cv_text) > 15000:
        cv_text = cv_text[:15000]
        logger.warning("CV text truncated to 15000 characters.")

    messages = build_cv_analysis_messages(cv_text)
    raw = call_llm(messages)
    data = parse_json_response(raw)

    # Clamp all scores 1-100
    data["overall_score"] = max(1, min(100, int(data.get("overall_score", 50))))
    for section in data.get("sections", {}).values():
        section["score"] = max(1, min(100, int(section.get("score", 50))))

    return data
