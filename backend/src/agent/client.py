import httpx
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def call_llm(messages: list[dict], model: str = None) -> str:
    api_key = settings.OPEN_ROUTER_API_KEY
    model = model or settings.OPEN_ROUTER_LLM_MODEL

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.SITE_URL,
        "X-Title": settings.SITE_NAME,
    }

    payload = {
        "model": model,
        "messages": messages,
    }

    try:
        with httpx.Client(timeout=60) as client:
            response = client.post(settings.OPEN_ROUTER_ENDPOINT, json=payload, headers=headers)
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
    