# System Architecture

## Architecture

```text
Browser
  ├── HTML5
  ├── CSS3
  └── TypeScript
       │
       ├── Supabase Auth
       ├── Supabase PostgreSQL
       └── Supabase Edge Function
                         │
                         └── Google Gemini API
```

## Frontend Modules
- `auth.ts`
- `activities.ts`
- `calculator.ts`
- `dashboard.ts`
- `analytics.ts`
- `goals.ts`
- `challenges.ts`
- `gamification.ts`
- `recommendations.ts`
- `profile.ts`
- `utils.ts`

## Backend
Supabase provides:
- Authentication
- PostgreSQL
- Row Level Security
- Edge Functions

## AI Boundary
Frontend sends a compact activity summary to the Edge Function. The Edge Function calls Gemini using a server-side secret and returns validated structured JSON.

## Recommended Pages
- `index.html`
- `login.html`
- `register.html`
- `dashboard.html`
- `activity.html`
- `analytics.html`
- `goals.html`
- `challenges.html`
- `profile.html`

## Data Flow
1. User authenticates.
2. Supabase establishes session.
3. User submits activity.
4. TypeScript retrieves active emission factor.
5. Calculator computes kg CO₂e.
6. Activity and calculation snapshot are saved.
7. Dashboard queries aggregates.
8. UI updates charts and KPIs.
9. Gemini receives summarized behavior through Edge Function.
10. Validated recommendations are stored/displayed.
