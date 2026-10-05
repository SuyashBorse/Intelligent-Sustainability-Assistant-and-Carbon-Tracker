# AI-Powered Personal Carbon Footprint Tracker & Sustainability Assistant

A modern, responsive carbon footprint tracking web application with interactive emission calculators, Chart.js analytics, real-time gamification, and Gemini AI coaching.

---

## 📁 Project Structure

```text
├── backend/                      # Backend & Database Configurations
│   └── database/
│       ├── schema.sql            # PostgreSQL schema definitions
│       └── DATABASE_SCHEMA.md    # Schema documentation & RLS policies
│
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
│   ├── AI_GEMINI_SPEC.md         # Gemini integration & prompt specifications
│   ├── UI_UX_SPEC.md             # UI/UX design tokens & responsive specifications
│   ├── EMISSION_CALCULATION_SPEC.md # GHG Protocol calculation formulas
│   ├── SECURITY_SPEC.md          # Security, auth, and privacy requirements
│   ├── API_SPEC.md               # API & Edge Function endpoint interfaces
│   ├── GAMIFICATION_SPEC.md      # Points, badges, challenges & streaks
│   ├── TEST_PLAN.md              # Automated & manual test scenarios
│   └── IMPLEMENTATION_PLAN.md    # Phased rollout and milestones
│
├── package.json                  # Node dependencies & Vite scripts
└── README.md                     # Repository overview & setup guide
```

---

## 🌟 Recent Updates (October 2026)
- **100% Mobile Responsiveness:** Enforced strict CSS boundaries, overflowing layout grids, and scalable topbar pills to guarantee a perfect layout on any mobile device.
- **Dynamic Analytics & Charts:** Upgraded the Analytics UI to feature a beautiful Polar Area chart and a custom horizontal stacked bar chart for visualizing dynamic goals & challenges progress with hover states.
- **Strict Gamification Engine:** Rewrote the streak engine to dynamically recalculate valid streaks directly from historical activity data, strictly enforcing the 24-hour activity rule.
- **Real-Time Data Driven UI:** Converted all remaining hardcoded placeholders (KPI trend badges, sustainability score percentile text, streak bonus targets) to dynamically compute from real user data.
- **Robust Demo Profile:** The pre-seeded demo user now comes with a rich 10-day activity history, perfect for showcasing the complete dashboard analytics and active gamification streaks immediately upon clone.

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
- **Backend / DB**: Supabase, PostgreSQL, Edge Functions (configured in `backend/`)
- **AI Integration**: Google Gemini API (Personalized decarbonization recommendations)

