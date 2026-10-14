-- Supabase Schema for EcoTrack

-- Drop existing tables to avoid 'already exists' errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS emission_factors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

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
  emission_factor_id TEXT,
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

-- Read access for global reference tables (allow both authenticated and anon reading)
CREATE POLICY "Enable read access for all users" ON emission_factors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON challenges FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON achievements FOR SELECT USING (true);

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

-- ============================================================================
-- SEED DATA: Master Emission Factors (IPCC / DEFRA / EPA / Our World in Data)
-- ============================================================================
INSERT INTO emission_factors (id, category, activity_type, unit, emission_factor, source, region) VALUES
  ('ef_trans_car_petrol', 'transportation', 'Car (Petrol / Gasoline)', 'km', 0.21, 'DEFRA 2023 / EPA', 'Global Average'),
  ('ef_trans_car_diesel', 'transportation', 'Car (Diesel)', 'km', 0.18, 'DEFRA 2023', 'Global Average'),
  ('ef_trans_car_ev', 'transportation', 'Electric Vehicle (EV)', 'km', 0.05, 'IEA Grid Avg', 'Global Average'),
  ('ef_trans_bus', 'transportation', 'City Bus / Public Transit', 'km', 0.08, 'EPA Transit', 'Global Average'),
  ('ef_trans_train', 'transportation', 'Train / Metro / Subway', 'km', 0.04, 'DEFRA Rail', 'Global Average'),
  ('ef_trans_flight_domestic', 'transportation', 'Flight (Short Haul / Domestic)', 'km', 0.25, 'ICAO / DEFRA', 'Global'),
  ('ef_trans_flight_long', 'transportation', 'Flight (Long Haul)', 'km', 0.15, 'ICAO / DEFRA', 'Global'),
  ('ef_trans_motorbike', 'transportation', 'Motorcycle / Scooter', 'km', 0.11, 'DEFRA 2023', 'Global Average'),
  ('ef_energy_grid', 'energy', 'Grid Electricity', 'kWh', 0.42, 'EIA / IEA', 'Average Mixed Grid'),
  ('ef_energy_gas', 'energy', 'Natural Gas (Heating / Cooking)', 'kWh', 0.20, 'EPA GHG Factors', 'Global Average'),
  ('ef_energy_heating_oil', 'energy', 'Heating Oil', 'liters', 2.70, 'DEFRA Fuel', 'Global Average'),
  ('ef_energy_solar', 'energy', 'Rooftop Solar', 'kWh', 0.02, 'NREL Lifecycle', 'Global'),
  ('ef_food_beef', 'food', 'Beef Meal', 'meals', 6.50, 'Poore & Nemecek (Science)', 'Global'),
  ('ef_food_chicken', 'food', 'Poultry / Chicken Meal', 'meals', 1.80, 'Our World in Data', 'Global'),
  ('ef_food_pork', 'food', 'Pork Meal', 'meals', 2.20, 'Our World in Data', 'Global'),
  ('ef_food_vegetarian', 'food', 'Vegetarian Meal (Eggs/Dairy)', 'meals', 0.90, 'Oxford Food Study', 'Global'),
  ('ef_food_vegan', 'food', '100% Plant-Based / Vegan Meal', 'meals', 0.50, 'Oxford Food Study', 'Global'),
  ('ef_food_dairy_milk', 'food', 'Dairy Milk', 'liters', 1.20, 'Poore & Nemecek', 'Global'),
  ('ef_water_shower', 'water', 'Hot Shower (8-10 mins)', 'showers', 0.85, 'Waterwise / Carbon Trust', 'Global Average'),
  ('ef_water_tap', 'water', 'Tap Water Supply', 'liters', 0.0003, 'UK Water Industry', 'Municipal'),
  ('ef_water_bottled', 'water', 'Bottled Water (Plastic 500ml)', 'bottles', 0.16, 'Beverage Council', 'Global'),
  ('ef_shop_clothing', 'shopping', 'Clothing / Apparel Item', 'items', 8.50, 'WRAP UK / Textile Exchange', 'Global'),
  ('ef_shop_smartphone', 'shopping', 'New Smartphone', 'units', 60.00, 'Apple / Fairphone Environmental Reports', 'Global'),
  ('ef_shop_laptop', 'shopping', 'New Laptop Computer', 'units', 200.00, 'Dell / HP Carbon Disclosures', 'Global'),
  ('ef_shop_general', 'shopping', 'General Household Consumer Goods', 'kg', 2.50, 'EPA WARM Model', 'Global')
ON CONFLICT (id) DO UPDATE SET
  emission_factor = EXCLUDED.emission_factor,
  source = EXCLUDED.source,
  region = EXCLUDED.region;

-- ============================================================================
-- SEED DATA: Default Sustainability Challenges
-- ============================================================================
INSERT INTO challenges (id, title, description, category, difficulty, points, target_value, unit) VALUES
  ('ch_01', 'Transit Pioneer', 'Log at least 5 public transit or cycling trips this week.', 'transportation', 'easy', 50, 5, 'trips'),
  ('ch_02', 'Plant Power Week', 'Record 4 plant-based meals in the food category.', 'food', 'medium', 50, 4, 'meals'),
  ('ch_03', 'Phantom Watt Hunter', 'Log energy baseline under 10 kWh for 3 consecutive days.', 'energy', 'hard', 60, 3, 'days'),
  ('ch_04', 'Mindful Consumer', 'Keep shopping and apparel purchases at 0 for 7 straight days.', 'shopping', 'medium', 75, 7, 'days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points = EXCLUDED.points;

-- ============================================================================
-- SEED DATA: Default Achievement Badges
-- ============================================================================
INSERT INTO achievements (id, name, description, icon, condition_type, condition_value, points) VALUES
  ('ach_01', 'First Step', 'Record your very first carbon activity log.', '🌱', 'activity_count', 1, 25),
  ('ach_02', 'Green Traveler', 'Log 5 public transit or zero-emission commute trips.', '🚲', 'transit_trips', 5, 50),
  ('ach_03', '7-Day Streak', 'Maintain a continuous daily carbon logging streak for 7 days.', '🔥', 'streak_days', 7, 75),
  ('ach_04', 'Energy Warden', 'Reduce home electricity consumption by 20% compared to baseline.', '⚡', 'energy_reduction', 20, 100),
  ('ach_05', 'Eco Champion', 'Accumulate 500+ sustainability points through active habits.', '👑', 'total_points', 500, 150)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points = EXCLUDED.points;

