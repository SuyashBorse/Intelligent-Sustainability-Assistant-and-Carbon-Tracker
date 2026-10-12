# 🌿 EcoTrack — Technical Documentation Package

Comprehensive engineering and product documentation package for **EcoTrack — Intelligent Sustainability Assistant & Carbon Tracker**, a responsive personal greenhouse gas (GHG) footprint tracking web application.

---

## 📖 Documentation Index

| Document | Description |
| :--- | :--- |
| [`PRD.md`](PRD.md) | **Product Requirements Document:** Core vision, target personas, IPCC/DEFRA factor repository, gamification rules, Gemini AI coaching, and end-to-end specifications. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | **System Architecture & Data Flows:** Component hierarchy, SPA view routing, client-cloud boundary, and Edge Function proxy flows. |
| [`AI_GEMINI_SPEC.md`](AI_GEMINI_SPEC.md) | **Gemini AI Integration Specification:** Privacy-preserving activity summarization, structured JSON schema enforcement, and Edge Function runtime contracts. |
| [`EMISSION_CALCULATION_SPEC.md`](EMISSION_CALCULATION_SPEC.md) | **Emission Calculation Engine:** Mathematical formulas, IPCC/DEFRA coefficient mappings, and snapshot preservation rules. |
| [`GAMIFICATION_SPEC.md`](GAMIFICATION_SPEC.md) | **Gamification & Behavioral Engine:** Points configuration, 24-hour rolling streak engine, achievement badges, and canvas confetti effects. |
| [`UI_UX_SPEC.md`](UI_UX_SPEC.md) | **UI/UX & Design Tokens:** Emerald sustainability design system, responsive breakpoints (320px–4K), and zero-FOUC Dark/Light theme engine. |
| [`SECURITY_SPEC.md`](SECURITY_SPEC.md) | **Security & Privacy Specification:** Supabase Auth sessions, PostgreSQL Row Level Security (RLS), input sanitization, and secrets management. |
| [`API_SPEC.md`](API_SPEC.md) | **API & Service Contracts:** Client store methods, optimistic cloud sync queue, and Supabase Edge Function request/response protocols. |
| [`TEST_PLAN.md`](TEST_PLAN.md) | **Test Plan & Acceptance Scenarios:** Functional tests, emission math verification, responsive layout checks, and AI schema validation. |
| [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) | **Implementation Milestones:** Phased development roadmap and production deployment checklist. |
| [`../backend/database/DATABASE_SCHEMA.md`](../backend/database/DATABASE_SCHEMA.md) | **Database Schema & RLS Policies:** PostgreSQL relational tables, foreign key constraints, indexing strategies, and security policies. |

---

## 🛠️ Technology Stack

- **Frontend:** Vanilla JavaScript (ES6+ Native Modules), HTML5 Semantic Layout, CSS3 Custom Properties (Design Tokens), Chart.js 4.4, Canvas Confetti
- **Tooling & Bundler:** Vite 5.4
- **Backend & Database:** Supabase PostgreSQL 17 with Row Level Security (RLS)
- **Serverless AI Gateway:** Supabase Edge Functions (Deno runtime)
- **AI Engine:** Google Gemini API (Structured JSON generation)
- **Scientific Standards:** IPCC Guidelines for National Greenhouse Gas Inventories, GHG Protocol Corporate Standard, DEFRA 2023, EPA GHG Hub

---

## 🔒 Security & Persistence Guidelines

1. **AI Credential Protection:** The Google Gemini API key (`GEMINI_API_KEY`) is stored exclusively as a server-side secret within Supabase Edge Functions. It is **never** exposed to browser-side code.
2. **Privacy-Preserving Summarization:** The client compiles only summarized, aggregated activity metrics (rolling category totals, percentage distributions, top activities) before dispatching to the AI; zero personal identification or raw notes are transmitted.
3. **Hybrid State Architecture:** Out-of-the-box offline/demo functionality operates via isolated LocalStorage keys (`ecotrack_account_<email>`), backed by an optimistic background synchronization layer (`supabaseSync.js`) connecting to Supabase PostgreSQL whenever credentials are configured.
