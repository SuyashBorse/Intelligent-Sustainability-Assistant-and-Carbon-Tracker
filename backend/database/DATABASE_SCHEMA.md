# Database Schema

## profiles
- `id UUID PRIMARY KEY REFERENCES auth.users(id)`
- `full_name TEXT`
- `avatar_url TEXT`
- `country TEXT`
- `preferred_unit TEXT`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

## emission_factors
- `id UUID PRIMARY KEY`
- `category TEXT`
- `activity_type TEXT`
- `unit TEXT`
- `emission_factor NUMERIC`
- `co2e_unit TEXT`
- `source TEXT`
- `region TEXT`
- `valid_from DATE`
- `valid_until DATE`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`

## activity_logs
- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users(id)`
- `category TEXT`
- `activity_type TEXT`
- `quantity NUMERIC`
- `unit TEXT`
- `emission_factor_id UUID REFERENCES emission_factors(id)`
- `co2e_kg NUMERIC`
- `activity_date DATE`
- `metadata JSONB`
- `created_at TIMESTAMPTZ`

## goals
- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users(id)`
- `title TEXT`
- `description TEXT`
- `target_co2e_reduction NUMERIC`
- `target_date DATE`
- `current_progress NUMERIC`
- `status TEXT`
- `created_at TIMESTAMPTZ`

## challenges
- `id UUID PRIMARY KEY`
- `title TEXT`
- `description TEXT`
- `category TEXT`
- `difficulty TEXT`
- `points INTEGER`
- `target_value NUMERIC`
- `unit TEXT`
- `is_active BOOLEAN`
- `created_at TIMESTAMPTZ`

## user_challenges
- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users(id)`
- `challenge_id UUID REFERENCES challenges(id)`
- `progress NUMERIC`
- `status TEXT`
- `started_at TIMESTAMPTZ`
- `completed_at TIMESTAMPTZ`

## achievements
- `id UUID PRIMARY KEY`
- `name TEXT`
- `description TEXT`
- `icon TEXT`
- `condition_type TEXT`
- `condition_value NUMERIC`
- `points INTEGER`

## user_achievements
- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users(id)`
- `achievement_id UUID REFERENCES achievements(id)`
- `unlocked_at TIMESTAMPTZ`

## ai_recommendations
- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users(id)`
- `recommendation_type TEXT`
- `title TEXT`
- `description TEXT`
- `priority TEXT`
- `estimated_impact NUMERIC`
- `category TEXT`
- `created_at TIMESTAMPTZ`

## Indexes
Create indexes on:
- `activity_logs(user_id, activity_date)`
- `activity_logs(category)`
- `goals(user_id)`
- `user_challenges(user_id)`
- `user_achievements(user_id)`
- `ai_recommendations(user_id, created_at)`

## RLS
Enable RLS on all user-owned tables. Policies must use `auth.uid() = user_id` or the equivalent ownership relationship.
