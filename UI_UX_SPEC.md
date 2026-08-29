# UI/UX Specification

## Design Direction
Modern sustainability SaaS:
- Clean
- Minimal
- Responsive
- Friendly
- Data-focused
- Accessible

## Global Navigation
- Dashboard
- Log Activity
- Analytics
- Goals
- Challenges
- Profile
- Logout

## Dashboard Hierarchy
```text
Dashboard
├── Header / Navigation
├── Welcome section
├── KPI cards
│   ├── Today
│   ├── This week
│   ├── This month
│   └── Sustainability score
├── Carbon trend chart
├── Category breakdown
├── Top emission contributors
├── Goal progress
└── AI Sustainability Coach
```

## Activity Form
```text
Category
  → Activity Type
  → Quantity
  → Unit
  → Optional metadata
  → Live estimated CO₂e
  → Save
```

## Required States
- Loading
- Empty
- Success
- Error
- Disabled
- Validation error

## Mobile
- Collapsible navigation.
- Single-column cards.
- Touch-friendly controls.
- Responsive charts.
- No horizontal overflow.

## Accessibility
Use semantic HTML, labels, keyboard navigation, visible focus, descriptive buttons, and non-color-only status indicators.
