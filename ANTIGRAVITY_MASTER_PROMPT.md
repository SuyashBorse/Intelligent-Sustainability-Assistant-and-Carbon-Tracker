# Antigravity Master Build Prompt

You are a senior full-stack architect, TypeScript engineer, Supabase engineer, UI/UX designer, data visualization engineer, and Gemini API integration specialist.

Build the complete AI-powered Personal Carbon Footprint Tracker described in this documentation package.

## Mandatory Stack
- HTML5
- CSS3
- TypeScript
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Edge Functions
- Google Gemini API
- Chart.js

Do NOT use React, Next.js, Vue, Angular, or another frontend framework.

## Mandatory Features
1. Email/password authentication.
2. Google OAuth.
3. User-specific persistent carbon history.
4. Five activity categories:
   - Transportation
   - Energy
   - Food
   - Water
   - Shopping/Purchases
5. Real-time estimated CO₂e calculation.
6. Configurable emission-factor database.
7. Responsive dashboard.
8. Daily/weekly/monthly/yearly analytics.
9. Category breakdown.
10. Goals.
11. Challenges.
12. Points, streaks, and badges.
13. Gemini-powered personalized recommendations.
14. Supabase RLS.
15. Secure Gemini Edge Function.
16. Accessible responsive UI.
17. Strong TypeScript typing.
18. Error/loading/empty states.

## Build Order
Follow `IMPLEMENTATION_PLAN.md` phase-by-phase.

## Security
Never expose Gemini API secrets in frontend code. Enforce ownership using Supabase RLS and `auth.uid()`.

## Data Integrity
Every activity must retain the emission-factor ID used to calculate its historical CO₂e value.

## AI
Gemini must return only schema-validated JSON. Never render AI output as executable HTML.

## Quality Bar
Do not create a static mockup. Build functional features connected to Supabase. Test each phase before moving forward.

## Completion Criteria
A new user must be able to register, authenticate, log an activity, receive an estimated CO₂e value, save it, view it on the dashboard, track goals/challenges, and generate secure personalized AI recommendations.

Use the other Markdown documents in this package as the authoritative product and technical specification.
