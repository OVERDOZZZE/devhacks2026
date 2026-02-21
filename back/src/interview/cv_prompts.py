def build_cv_analysis_messages(cv_text: str) -> list[dict]:
    system_content = (
        "You are an expert career coach and professional resume reviewer with 15+ years of experience "
        "in talent acquisition, HR, and career development across multiple industries. "
        "You provide honest, actionable, and detailed feedback on resumes and CVs."
    )

    user_content = f"""Analyse the following CV/resume thoroughly and return ONLY valid JSON (no markdown fences, no extra text).

CV CONTENT:
{cv_text.strip()}

Return this exact JSON structure:
{{
  "candidate_name": "<full name from CV or 'Unknown'>",
  "current_role": "<most recent job title or 'Not specified'>",
  "years_experience": <estimated total years as integer, 0 if unclear>,
  "overall_score": <integer 1-100>,
  "overall_summary": "<2-3 sentence honest overall assessment>",
  "sections": {{
    "impact": {{
      "score": <integer 1-100>,
      "label": "Impact & Achievements",
      "summary": "<1-2 sentences>",
      "positives": ["<point>", ...],
      "improvements": ["<actionable suggestion>", ...]
    }},
    "clarity": {{
      "score": <integer 1-100>,
      "label": "Clarity & Structure",
      "summary": "<1-2 sentences>",
      "positives": ["<point>", ...],
      "improvements": ["<actionable suggestion>", ...]
    }},
    "skills": {{
      "score": <integer 1-100>,
      "label": "Skills & Keywords",
      "summary": "<1-2 sentences>",
      "positives": ["<point>", ...],
      "improvements": ["<actionable suggestion>", ...]
    }},
    "experience": {{
      "score": <integer 1-100>,
      "label": "Experience Depth",
      "summary": "<1-2 sentences>",
      "positives": ["<point>", ...],
      "improvements": ["<actionable suggestion>", ...]
    }},
    "ats": {{
      "score": <integer 1-100>,
      "label": "ATS Compatibility",
      "summary": "<1-2 sentences>",
      "positives": ["<point>", ...],
      "improvements": ["<actionable suggestion>", ...]
    }}
  }},
  "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "critical_fixes": ["<most important fix 1>", "<most important fix 2>", "<most important fix 3>"],
  "detected_skills": ["<skill>", ...],
  "industry_fit": ["<industry or role type this CV suits>", ...]
}}"""

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": user_content},
    ]
