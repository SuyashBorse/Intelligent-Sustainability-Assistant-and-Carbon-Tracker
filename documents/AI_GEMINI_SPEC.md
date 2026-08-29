# AI & Gemini Integration Specification

## Purpose
Generate practical, personalized sustainability recommendations from summarized user behavior.

## Security
Never place `GEMINI_API_KEY` in browser TypeScript. The browser calls a Supabase Edge Function.

## Request
```json
{
  "period": "last_30_days",
  "total_co2_kg": 185.4,
  "categories": {
    "transportation": 82.1,
    "energy": 51.3,
    "food": 32.5,
    "water": 7.5,
    "shopping": 12
  },
  "top_activities": [
    {"activity": "car", "co2_kg": 64.2},
    {"activity": "electricity", "co2_kg": 48.7}
  ],
  "recent_trend": "increasing"
}
```

## Required JSON Response
```json
{
  "summary": "string",
  "overall_priority": "low | medium | high",
  "recommendations": [
    {
      "title": "string",
      "category": "transportation | energy | food | water | shopping",
      "priority": "low | medium | high",
      "reason": "string",
      "action": "string",
      "estimated_impact_kg_co2_per_month": 0,
      "difficulty": "easy | medium | hard"
    }
  ]
}
```

## AI Rules
- Return only valid JSON.
- Do not shame the user.
- Use supplied data only.
- Prioritize high-impact and practical actions.
- Label impact as estimated.
- Avoid unsupported claims.
- Do not provide medical, financial, or dangerous advice.

## Failure Handling
If JSON parsing or schema validation fails:
1. Do not display the malformed response.
2. Log a safe diagnostic server-side.
3. Return a user-friendly error.
4. Allow retry.
