-- Supabase Schema for EcoTrack

-- Set up tables

-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'India',
  preferred_unit TEXT DEFAULT 'kg',
  reduction_target NUMERIC DEFAULT 20,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_logged_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- emission_factors
CREATE TABLE emission_factors (
  id TEXT PRIMARY KEY,
  category TEXT,
  activity_type TEXT,
  unit TEXT,
  emission_factor NUMERIC,
  co2e_unit TEXT DEFAULT 'kg',
  source TEXT,
  region TEXT,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- activity_logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  activity_type TEXT,
  quantity NUMERIC,
  unit TEXT,
  emission_factor_id TEXT REFERENCES emission_factors(id),
  co2e_kg NUMERIC,
  activity_date DATE DEFAULT current_date,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  target_co2e_reduction NUMERIC,
  target_date DATE,
  current_progress NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'not_started',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- challenges
CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  points INTEGER,
  target_value NUMERIC,
  unit TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- user_challenges
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT REFERENCES challenges(id),
  progress NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  adopted_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- achievements
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  icon TEXT,
  condition_type TEXT,
  condition_value NUMERIC,
  points INTEGER
);

-- user_achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- ai_recommendations
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT,
  title TEXT,
  description TEXT,
  priority TEXT,
  estimated_impact NUMERIC,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Indexes
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, activity_date);
CREATE INDEX idx_activity_logs_category ON activity_logs(category);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id, created_at);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Read-only tables can be accessed by authenticated users
ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Activity Logs
CREATE POLICY "Users can manage own activities" ON activity_logs FOR ALL USING (auth.uid() = user_id);

-- Policies for Goals
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Policies for User Challenges
CREATE POLICY "Users can manage own challenges" ON user_challenges FOR ALL USING (auth.uid() = user_id);

-- Policies for User Achievements
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- Policies for AI Recommendations
CREATE POLICY "Users can manage own recommendations" ON ai_recommendations FOR ALL USING (auth.uid() = user_id);

-- Read access for global tables
CREATE POLICY "Enable read access for all authenticated users" ON emission_factors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON challenges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON achievements FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
