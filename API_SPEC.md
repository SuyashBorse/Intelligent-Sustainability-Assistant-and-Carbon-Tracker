# API & Service Specification

## Supabase Client
Frontend uses the Supabase JavaScript client for:
- Auth
- CRUD
- Database queries

## Logical Services

### Auth
- `registerWithEmail()`
- `loginWithEmail()`
- `loginWithGoogle()`
- `logout()`
- `resetPassword()`
- `getSession()`

### Activities
- `createActivity()`
- `getActivities()`
- `updateActivity()`
- `deleteActivity()`

### Analytics
- `getDailyStats()`
- `getWeeklyStats()`
- `getMonthlyStats()`
- `getCategoryBreakdown()`
- `getTopContributors()`

### Goals
- `createGoal()`
- `getGoals()`
- `updateGoalProgress()`

### Gamification
- `getChallenges()`
- `startChallenge()`
- `updateChallengeProgress()`
- `getAchievements()`

### AI
Frontend invokes:
`generate-recommendations`

Edge Function:
1. Verify authenticated user.
2. Validate request.
3. Query/receive summarized data.
4. Call Gemini.
5. Validate structured output.
6. Return JSON.

## Error Contract
Use predictable responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid activity data."
  }
}
```
