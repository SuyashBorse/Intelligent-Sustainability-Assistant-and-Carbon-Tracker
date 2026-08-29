# AI-Powered Personal Carbon Footprint Tracker

Project documentation package for building a responsive carbon-footprint tracking web application using HTML5, CSS3, TypeScript, Supabase, and Google Gemini.

## Documentation
- `PRD.md` — Product Requirements Document
- `ARCHITECTURE.md` — System architecture and technical design
- `DATABASE_SCHEMA.md` — PostgreSQL/Supabase schema and RLS requirements
- `AI_GEMINI_SPEC.md` — Gemini integration and structured-output specification
- `UI_UX_SPEC.md` — UI/UX and component hierarchy
- `EMISSION_CALCULATION_SPEC.md` — Carbon calculation engine and emission-factor design
- `SECURITY_SPEC.md` — Authentication, RLS, secrets, and security requirements
- `API_SPEC.md` — Frontend/backend/Edge Function interfaces
- `GAMIFICATION_SPEC.md` — Goals, challenges, points, badges, and streaks
- `TEST_PLAN.md` — Functional, security, responsive, and AI testing plan
- `IMPLEMENTATION_PLAN.md` — Recommended phased implementation plan
- `ANTIGRAVITY_MASTER_PROMPT.md` — Master build prompt for Antigravity

## Stack
HTML5, CSS3, TypeScript, Supabase, PostgreSQL, Supabase Auth, Supabase Edge Functions, Google Gemini API, Chart.js.

## Important
Gemini secrets must never be exposed in frontend code. Use a Supabase Edge Function for Gemini calls.
