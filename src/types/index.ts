export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'specific_days' | 'custom';
export type TargetType = 'boolean' | 'measurable';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  timezone: string;
  xp: number;
  level: number;
  gamification_enabled: boolean;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon: string;
  category: string;
  accent_color: string;
  frequency_type: FrequencyType;
  frequency_days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  target_type: TargetType;
  target_value: number;
  target_unit: string;
  reminder_time?: string; // HH:mm
  start_date: string;
  is_archived: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  completed: boolean;
  value: number;
  completed_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  target_days: number;
  habit_ids: string[];
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: 'streak' | 'completions' | 'perfect_days' | 'level';
  requirement_value: number;
  unlocked_at?: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0..100
  thisWeekRate: number;
  thisMonthRate: number;
}

export interface DailySummary {
  date: string;
  totalHabits: number;
  completedHabits: number;
  percentage: number;
  earnedXp: number;
}

export interface UserInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'milestone';
  title: string;
  description: string;
  metric?: string;
}
