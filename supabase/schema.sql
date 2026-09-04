-- HabitFlow Production Database Schema & Row Level Security (RLS) Policies

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    gamification_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 3. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'CheckCircle',
    category TEXT DEFAULT 'Personal',
    accent_color TEXT DEFAULT '#3B82F6',
    frequency_type TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekdays', 'weekends', 'specific_days', 'custom'
    frequency_days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sun, 1=Mon, ..., 6=Sat
    target_type TEXT NOT NULL DEFAULT 'boolean', -- 'boolean' or 'measurable'
    target_value NUMERIC DEFAULT 1,
    target_unit TEXT DEFAULT 'times',
    reminder_time TEXT, -- HH:mm string e.g. "20:00"
    start_date DATE DEFAULT CURRENT_DATE,
    is_archived BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" 
    ON public.habits FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" 
    ON public.habits FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" 
    ON public.habits FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" 
    ON public.habits FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Habit Logs Table
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    value NUMERIC DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, log_date)
);

-- Enable RLS on Habit Logs
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit logs" 
    ON public.habit_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs" 
    ON public.habit_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs" 
    ON public.habit_logs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs" 
    ON public.habit_logs FOR DELETE 
    USING (auth.uid() = user_id);

-- 5. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    target_days INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" 
    ON public.goals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" 
    ON public.goals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
    ON public.goals FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" 
    ON public.goals FOR DELETE 
    USING (auth.uid() = user_id);

-- 6. Goal Habits Table (Junction table)
CREATE TABLE IF NOT EXISTS public.goal_habits (
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, habit_id)
);

ALTER TABLE public.goal_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage goal habits" 
    ON public.goal_habits FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.goals g 
            WHERE g.id = goal_id AND g.user_id = auth.uid()
        )
    );

-- 7. Achievements Catalog
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement_type TEXT NOT NULL, -- 'streak', 'completions', 'perfect_days', 'level'
    requirement_value INTEGER NOT NULL
);

-- Seed Initial Achievements
INSERT INTO public.achievements (id, title, description, icon, requirement_type, requirement_value) VALUES
('first_streak', 'First Streak', 'Complete a habit for 3 consecutive days.', 'Flame', 'streak', 3),
('week_warrior', 'Week Warrior', 'Maintain a 7-day streak on any habit.', 'ShieldCheck', 'streak', 7),
('month_master', 'Month Master', 'Maintain a 30-day streak on any habit.', 'Trophy', 'streak', 30),
('perfect_day', 'Perfect Day', 'Complete 100% of your active habits in a single day.', 'Sparkles', 'perfect_days', 1),
('consistent', 'Consistent Champion', 'Reach 90% completion rate across a month.', 'Rocket', 'completions', 50),
('study_machine', 'Dedicated Scholar', 'Complete study or learning habits 30 times.', 'BookOpen', 'completions', 30)
ON CONFLICT (id) DO NOTHING;

-- 8. User Achievements Junction
CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" 
    ON public.user_achievements FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock own achievements" 
    ON public.user_achievements FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 9. Trigger for Auto Creating Profile on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
