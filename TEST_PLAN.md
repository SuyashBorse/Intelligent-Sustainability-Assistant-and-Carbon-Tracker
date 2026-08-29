# Test Plan

## Authentication
- Registration succeeds.
- Duplicate email is handled.
- Incorrect password is handled.
- Google OAuth works.
- Logout clears session.
- Protected pages reject unauthenticated users.

## Activity Logging
- Valid activity saves.
- Invalid quantity rejected.
- Negative quantity rejected.
- Correct factor selected.
- CO₂e calculation is correct for configured factor.
- Activity date is stored correctly.

## Privacy / RLS
- User A cannot read User B's activity.
- User A cannot update User B's activity.
- User A cannot delete User B's activity.
- User-owned recommendations remain private.

## Dashboard
- KPIs match database aggregates.
- Category totals sum correctly.
- Empty state appears for new users.
- Charts respond to filters.

## Gemini
- Valid response displays.
- Invalid JSON is rejected.
- API failure shows retry state.
- Empty history is handled.
- Prompt does not expose secrets.

## Responsive
Test:
- 320px
- 375px
- 768px
- 1024px
- 1440px

## Accessibility
- Keyboard-only navigation.
- Form labels.
- Focus visibility.
- Screen-reader-friendly controls.
- Status is not communicated by color alone.
