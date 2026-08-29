# AI-Powered Personal Carbon Footprint Tracker & Sustainability Assistant

A modern, responsive carbon footprint tracking web application with interactive emission calculators, Chart.js analytics, real-time gamification, and Gemini AI coaching.

---

## 📁 Project Structure

```text
├── frontend/                     # Web Application Frontend
│   ├── index.html                # Main application workspace & views
│   ├── login.html                # Sign-in portal
│   ├── register.html             # User registration portal
│   ├── css/
│   │   ├── main.css              # Design tokens, themes & layout shell
│   │   ├── components.css        # Buttons, modals, cards, badges & forms
│   │   └── pages.css             # Page-specific views & analytics styles
│   └── js/
│       ├── app.js                # UI orchestration & event controller
│       ├── store.js              # Client state store & local persistence
│       ├── calculator.js         # Carbon calculation engine
│       ├── emissionFactors.js    # IPCC emission factor repository
│       ├── charts.js             # Chart.js visualization engine
│       ├── gamification.js       # Streaks, points & badge evaluation
│       └── aiCoach.js            # Sustainability assistant & recommendations
│
├── documents/                    # Architectural Specifications & Documentation
│   ├── PRD.md                    # Product Requirements Document
│   ├── ARCHITECTURE.md           # System architecture and technical design
│   ├── DATABASE_SCHEMA.md        # PostgreSQL/Supabase schema & RLS
│   ├── AI_GEMINI_SPEC.md         # Gemini integration & prompt specifications
│   ├── UI_UX_SPEC.md             # UI/UX design tokens & responsive specifications
│   ├── EMISSION_CALCULATION_SPEC.md # GHG Protocol calculation formulas
│   ├── SECURITY_SPEC.md          # Security, auth, and privacy requirements
│   ├── API_SPEC.md               # API & Edge Function endpoint interfaces
│   ├── GAMIFICATION_SPEC.md      # Points, badges, challenges & streaks
│   ├── TEST_PLAN.md              # Automated & manual test scenarios
│   ├── IMPLEMENTATION_PLAN.md    # Phased rollout and milestones
│   └── ANTIGRAVITY_MASTER_PROMPT.md # Antigravity coding instructions
│
├── package.json                  # Node dependencies & Vite scripts
└── README.md                     # Repository overview & setup guide
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Serves the `frontend/` directory at `http://localhost:3000/`.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3 Variables, Vanilla ES Modules, Chart.js
- **Development**: Vite (ESM Dev Server)
- **Backend / DB (Target)**: Supabase, PostgreSQL, Edge Functions
- **AI Integration**: Google Gemini API (Personalized decarbonization recommendations)

