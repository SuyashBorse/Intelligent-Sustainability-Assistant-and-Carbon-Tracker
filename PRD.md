# Product Requirements Document (PRD)

## 1. Product
**AI-Powered Personal Carbon Footprint Tracker**

## 2. Vision
Help individuals understand, track, and reduce their estimated personal CO₂e emissions through simple activity logging, analytics, goals, gamification, and personalized AI recommendations.

## 3. Target Users
- Students
- Young professionals
- Environment-conscious individuals
- Users beginning a sustainability journey

## 4. Core User Journey
1. Register or sign in.
2. Complete basic profile.
3. Log daily activities.
4. See estimated CO₂e immediately.
5. Review dashboard and trends.
6. Identify major emission sources.
7. Set reduction goals.
8. Complete sustainability challenges.
9. Earn points and badges.
10. Ask the AI sustainability coach for personalized recommendations.

## 5. Functional Requirements

### Authentication
- Email/password registration and login.
- Google OAuth.
- Logout.
- Password reset.
- Persistent sessions.
- Protected application pages.

### Activity Logging
Five categories:
1. Transportation
2. Energy
3. Food
4. Water
5. Shopping/Purchases

Each log stores activity type, quantity, unit, emission-factor reference, calculated kg CO₂e, date, and optional metadata.

### Carbon Calculation
- Calculate estimates in real time.
- Use centralized emission factors.
- Preserve the emission factor used for each historical calculation.
- Display results as estimated CO₂e.

### Dashboard
Show:
- Today's emissions
- Weekly emissions
- Monthly emissions
- Total emissions
- Period-over-period change
- Category breakdown
- Highest contributors
- Sustainability score
- Goal progress

### Analytics
Support:
- Daily
- Weekly
- Monthly
- Yearly
- Custom date range
- Category filters

### AI Recommendations
Gemini analyzes summarized user activity and returns validated structured JSON containing:
- Summary
- Priority
- Recommendations
- Category
- Reason
- Action
- Estimated monthly impact
- Difficulty

### Gamification
- Points
- Streaks
- Challenges
- Achievement badges
- Goal completion rewards

### Goals
Users can create CO₂ reduction targets with target date and progress tracking.

## 6. Non-Functional Requirements
- Responsive from 320px through desktop.
- Accessible semantic HTML.
- Secure Supabase RLS.
- No frontend exposure of Gemini secret.
- Strong TypeScript typing.
- Modular code.
- Graceful error and loading states.
- Efficient database queries.

## 7. Success Criteria
A user can independently register, log activities, see accurate application calculations based on configured factors, review historical trends, set goals, complete challenges, and obtain personalized Gemini recommendations while only accessing their own data.

## 8. Scope Exclusions
- Financial rewards/redemptions.
- Guaranteed scientific precision.
- Medical or financial advice.
- Native mobile apps.
