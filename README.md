# 🌿 Intelligent Sustainability Assistant & Carbon Tracker

An intelligent, full-featured personal carbon footprint tracking web application with interactive greenhouse gas (GHG) emission calculators, dynamic Chart.js analytics, real-time gamification streaks, and Google Gemini AI sustainability coaching.

[![Live Web App](https://img.shields.io/badge/live_deployment-ecotrack--app--peach.vercel.app-059669?style=for-the-badge&logo=vercel)](https://ecotrack-app-peach.vercel.app/)
[![CI & Quality Assurance](https://github.com/SuyashBorse/Intelligent-Sustainability-Assistant-and-Carbon-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/SuyashBorse/Intelligent-Sustainability-Assistant-and-Carbon-Tracker/actions)
[![Vite](https://img.shields.io/badge/bundler-Vite_5.4-646CFF.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/backend-Supabase_PostgreSQL_17-3ECF8E.svg)](https://supabase.com/)
[![Chart.js](https://img.shields.io/badge/visualizations-Chart.js_4.4-FF6384.svg)](https://www.chartjs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4.svg)](https://deepmind.google/technologies/gemini/)

> **🌐 Live Production Application:** [https://ecotrack-app-peach.vercel.app/](https://ecotrack-app-peach.vercel.app/)

---

## ✨ Key Features

- **⚡ Multi-Category Carbon Emission Calculator:**
  - Accurately tracks emissions across **Transportation** (petrol/diesel car, EV, metro, bus, domestic/international flights), **Energy** (electricity, natural gas, LPG), **Food** (beef, chicken, dairy, plant-based meals), **Water**, and **Shopping & Waste**.
  - Built strictly upon validated **IPCC** and **GHG Protocol** emission factor coefficients.

- **🔍 Filterable Activity History & Search:**
  - Dynamic category filter pills (`All`, `🚗 Transport`, `⚡ Energy`, `🥗 Food`, `💧 Water`, `🛍️ Shopping`) with live counts.
  - Real-time keyword search across activity descriptions and single-day date picker filtering with 1-click reset.

- **📊 Dynamic Analytics & Visualizations:**
  - Interactive multi-period trend analytics (7 days, 30 days, 90 days, 1 year).
  - High-resolution **Chart.js** visualizations including Doughnut category breakdowns, custom Polar Area distribution charts, and horizontal stacked progress charts for active goals and challenges.
  - Silky smooth cubic-bezier number counters and KPI trend indicators comparing rolling periods.

- **🤖 Gemini AI Sustainability Coach:**
  - Generates personalized, non-judgmental, and practical decarbonization recommendations based on summarized user activity payloads.
  - Enforces strict structured JSON schema output with category priorities, difficulty tiers, and estimated monthly $\text{kg CO}_2\text{e}$ savings.
  - Protected via **zero-activity token guard** (0 API calls when accounts have 0 activities) and serverless Supabase Edge Functions with zero browser key leakage.

- **🏆 Gamification & Habit Building Engine:**
  - **Strict Streak Engine:** Recalculates consecutive logging days dynamically from historical activity timestamps enforcing the 24-hour activity window.
  - **Eco Points & Milestones:** Earn points for logging actions, completing reduction goals, and adopting eco-friendly habits.
  - **Achievements & Badges:** Unlock badges with interactive HTML5 canvas confetti celebrations.

- **🔄 Hybrid Local & Cloud Persistence:**
  - Works instantly out of the box with an isolated, multi-account client-side storage engine and 1-click rich demo (`kalpesh@demo.com`).
  - Full **Supabase PostgreSQL 17** schema and RLS (Row Level Security) policies with an optimistic UI synchronization layer (`supabaseSync.js`) and authentication flows (`auth.js` with Google OAuth).

- **📱 100% Mobile Responsive Design:**
  - Mobile-first CSS design tokens with adaptive sidebar, scalable stat pills, accessible modals, and touch-optimized action drawers.

---

## 📁 Project Structure

```text
├── backend/                              # Backend & Database Configurations
│   └── database/
│       ├── schema.sql                    # PostgreSQL schema, triggers, RLS & seed data
│       └── DATABASE_SCHEMA.md            # Schema documentation & RLS security model
│
├── frontend/                             # Web Application Frontend
│   ├── index.html                        # Main dashboard & interactive workspaces
│   ├── login.html                        # User login & authentication portal
│   ├── register.html                     # New user registration portal
│   ├── css/
│   │   ├── main.css                      # Design tokens, variables & layout shell
│   │   ├── components.css                # Buttons, modals, cards, badges & inputs
│   │   └── pages.css                     # Page-specific views & analytics styles
│   └── js/
│       ├── app.js                        # Master UI orchestrator & router
│       ├── store.js                      # Client state store & local persistence
│       ├── auth.js                       # Supabase authentication controller
│       ├── supabaseClient.js             # Supabase client initializer
│       ├── supabaseSync.js               # Optimistic background cloud sync
│       ├── calculator.js                 # GHG emission calculation engine
│       ├── emissionFactors.js            # IPCC emission factors repository
│       ├── charts.js                     # Chart.js visualization engine
│       ├── gamification.js               # Streaks, points & badge evaluation
│       └── aiCoach.js                    # Gemini AI coach service & payload builder
│
├── supabase/                             # Local Supabase & Edge Functions
│   ├── config.toml                       # Supabase project configuration
│   └── functions/
│       └── generate-recommendations/     # Gemini Edge Function (Deno runtime)
│           ├── index.js                  # Edge Function handler
│           └── deno.json                 # Deno imports and dependencies
│
├── documents/                            # Technical Specifications & Documentation
│   ├── PRD.md                            # Product Requirements Document
│   ├── ARCHITECTURE.md                   # System architecture & technical design
│   ├── AI_GEMINI_SPEC.md                 # Gemini integration & prompt specifications
│   ├── UI_UX_SPEC.md                     # UI/UX design tokens & responsive specs
│   ├── EMISSION_CALCULATION_SPEC.md      # GHG Protocol calculation formulas
│   ├── SECURITY_SPEC.md                  # Security, auth, and privacy requirements
│   ├── API_SPEC.md                       # API & Edge Function service contracts
│   ├── GAMIFICATION_SPEC.md              # Points, badges, challenges & streaks
│   ├── TEST_PLAN.md                      # Automated & manual test scenarios
│   └── IMPLEMENTATION_PLAN.md            # Phased rollout & implementation milestones
│
├── .env.example                          # Environment variable template
├── package.json                          # Project scripts & dependencies
└── README.md                             # Repository documentation & setup guide
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- *(Optional)* [Supabase CLI](https://supabase.com/docs/guides/cli) for local backend & edge function development

---

### 1. Clone the Repository
```bash
git clone https://github.com/SuyashBorse/Intelligent-Sustainability-Assistant-and-Carbon-Tracker.git
cd "Intelligent-Sustainability-Assistant-and-Carbon-Tracker"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Note: If running in pure offline/demo mode, the app gracefully falls back to local storage automatically.)*

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000/`.

### 5. Production Build
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### 6. Live Production Deployment (Vercel)
The project is deployed on Vercel with automatic continuous deployment from GitHub:
- **Live URL:** [https://ecotrack-app-peach.vercel.app/](https://ecotrack-app-peach.vercel.app/)
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## ⚡ Supabase & Backend Setup (Optional)

### 1. Initialize Database Schema
If you are connecting a Supabase instance (locally or cloud):
1. Navigate to your Supabase SQL Editor.
2. Execute the SQL script located in [`backend/database/schema.sql`](backend/database/schema.sql).
3. This creates all relational tables (`profiles`, `activity_logs`, `goals`, `challenges`, `achievements`, `ai_recommendations`), enables Row Level Security (RLS), and sets up user creation triggers.

### 2. Serve Edge Functions Locally
To run the Gemini Edge Function locally using the Supabase CLI:
```bash
# Start local Supabase containers (requires Docker)
npx supabase start

# Set Gemini API key for local functions
npx supabase secrets set GEMINI_API_KEY="your-gemini-api-key"

# Serve the recommendations Edge Function
npx supabase functions serve generate-recommendations
```

---

## 👤 Demo Profile vs. New User Experience

- **Rich Pre-Seeded Demo:**
  - Launching the app automatically provides access to a pre-configured demo account (`kalpesh@demo.com`) equipped with a realistic 10-day activity history, dynamic trend charts, active streaks, and badge progress.
- **Isolated Multi-Account Architecture:**
  - Registering a new user via `register.html` creates a brand-new, isolated account state starting with clean baselines and customizable reduction goals.

---

## 🛠️ Tech Stack & Standards

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Vanilla JavaScript (ES6+ Modules), HTML5, CSS3 Custom Properties, Chart.js 4.4, Canvas Confetti |
| **Tooling & Bundler** | Vite 5.4 |
| **Backend Database** | Supabase (PostgreSQL 17), Row Level Security (RLS) |
| **Serverless Runtime**| Supabase Edge Functions (Deno Runtime) |
| **AI Integration** | Google Gemini API (Structured JSON generation) |
| **Standards** | IPCC Guidelines for National Greenhouse Gas Inventories, GHG Protocol Corporate Standard |

---

## 📖 Detailed Documentation

Comprehensive architectural and engineering specifications are available in the [`documents/`](documents/) directory:
- [Product Requirements Document (PRD)](documents/PRD.md)
- [System Architecture & Data Flows](documents/ARCHITECTURE.md)
- [Gemini AI Integration Specification](documents/AI_GEMINI_SPEC.md)
- [Emission Calculation Formulas & IPCC Factors](documents/EMISSION_CALCULATION_SPEC.md)
- [Database Schema & RLS Policies](backend/database/DATABASE_SCHEMA.md)
- [Security & Privacy Specifications](documents/SECURITY_SPEC.md)
- [API & Edge Function Contract](documents/API_SPEC.md)
- [Gamification Engine Specification](documents/GAMIFICATION_SPEC.md)
- [Test Plan & Test Cases](documents/TEST_PLAN.md)
- [Implementation Plan & Milestones](documents/IMPLEMENTATION_PLAN.md)
