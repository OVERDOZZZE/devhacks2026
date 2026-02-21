# 🎙️ AI Mock Interview Platform

An AI-powered mock interview platform that simulates realistic technical and behavioral interviews — helping users build confidence through repeated, structured practice.

---

## The Problem

Interview anxiety suppresses performance. Many strong candidates fail not because they lack knowledge, but because stress interferes at the critical moment.

---

## What It Does

Users select a target role, provide a job description, choose a difficulty level, and enter a timed interview session. The system generates personalized questions tailored to the role and context.

A voice-based AI interviewer asks questions in real time. After each response, structured feedback highlights what was strong, what was missing, and how to improve. At the end, a performance summary surfaces patterns across the full session.

---

## Tech Stack

**Frontend** - React, LiveKit Components  
**Backend** - Django REST Framework, OpenRouter LLM API  
**Voice** - LiveKit Agents, OpenAI STT/TTS, Silero VAD  
**Auth** - Token-based authentication

---

## Key Features

-  **Live voice interviews** — real-time speech with an AI interviewer via LiveKit
-  **Personalized questions** — generated from job description and agent prompt
-  **Per-answer scoring** — structured feedback with a 1–10 score for each response
-  **Session summary** — overall score and feedback across all answers
-  **Repeatable sessions** — designed for progressive improvement over time

---

## How It Works

1. User creates an interview, selects an agent, and optionally pastes a job description
2. Backend generates questions via LLM and initializes a LiveKit room
3. AI agent joins the room, asks questions via TTS, and captures spoken answers via STT
4. On completion, answers are evaluated by LLM and results are saved
5. User reviews per-question feedback and overall performance score

---

## Getting Started

### Backend
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Agent
```bash
python src/livekit/agent.py start
```

### Frontend
```bash
npm install
npm run dev
```

> Configure `.env` with your `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`, and `OPEN_ROUTER_API_KEY`.

---

## What's Next

- Speech pattern and delivery analysis
- Company-specific interview simulations
- Long-term progress tracking across sessions

---

*Built for the people who are ready — they just need the reps.*
