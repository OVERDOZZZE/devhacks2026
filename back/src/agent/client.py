import httpx
import logging
from decouple import config

logger = logging.getLogger(__name__)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "mistralai/mistral-7b-instruct:free"


def call_llm(messages: list[dict], model: str = DEFAULT_MODEL) -> str:

    api_key = config("OPENROUTER_API_KEY")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": config("SITE_URL", default="http://localhost:8000"),
        "X-Title": config("SITE_NAME", default="MockInterview"),
    }

    payload = {
        "model": model,
        "messages": messages,
    }

    try:
        with httpx.Client(timeout=60) as client:
            response = client.post(OPENROUTER_API_URL, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.error("OpenRouter HTTP error %s: %s", exc.response.status_code, exc.response.text)
        raise RuntimeError(f"LLM request failed with status {exc.response.status_code}.") from exc
    except httpx.RequestError as exc:
        logger.error("OpenRouter request error: %s", exc)
        raise RuntimeError("LLM request failed due to a network error.") from exc

    data = response.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        logger.error("Unexpected OpenRouter response structure: %s", data)
        raise RuntimeError("Unexpected response from LLM.") from exc
    