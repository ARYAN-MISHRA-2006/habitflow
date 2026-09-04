import { Habit, HabitLog, Goal, Achievement, Profile } from '../types';
import { format, subDays } from 'date-fns';

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');

export const initialProfile: Profile = {
  id: 'demo-user-123',
  name: 'Aryan Mishra',
  email: 'aryan@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  timezone: 'Asia/Kolkata',
  xp: 1240,
  level: 12,
  gamification_enabled: true,
  theme: 'system',
  created_at: format(subDays(today, 60), 'yyyy-MM-dd'),
};

export const initialHabits: Habit[] = [
  {
    id: 'h-water',
    user_id: 'demo-user-123',
    name: 'Drink 2.5L water',
    description: 'Stay hydrated throughout the day',
    icon: 'Droplet',
    category: 'Health',
    accent_color: '#3B82F6', // blue
    frequency_type: 'daily',
    frequency_days: [0, 1, 2, 3, 4, 5, 6],
    target_type: 'measurable',
    target_value: 2.5,
    target_unit: 'Liters',
    reminder_time: '08:00',
    start_date: format(subDays(today, 45), 'yyyy-MM-dd'),
    is_archived: false,
    is_active: true,
    created_at: format(subDays(today, 45), 'yyyy-MM-dd'),
  },
  {
    id: 'h-workout',
    user_id: 'demo-user-123',
    name: 'Workout',
    description: 'Gym session or high intensity cardio',
    icon: 'Dumbbell',
    category: 'Fitness',
    accent_color: '#EF4444', // red
    frequency_type: 'weekdays',
    frequency_days: [1, 2, 3, 4, 5],
    target_type: 'measurable',
    target_value: 30,
    target_unit: 'minutes',
    reminder_time: '09:00',
    start_date: format(subDays(today, 50), 'yyyy-MM-dd'),
    is_archived: false,
    is_active: true,
    created_at: format(subDays(today, 50), 'yyyy-MM-dd'),
  },
  {
    id: 'h-read',
    user_id: 'demo-user-123',
    name: 'Read 20 pages',
    description: 'Non-fiction, technical, or self-growth books',
    icon: 'BookOpen',
    category: 'Personal Growth',
    accent_color: '#10B981', // emerald
    frequency_type: 'daily',
    frequency_days: [0, 1, 2, 3, 4, 5, 6],
    target_type: 'measurable',
    target_value: 20,
    target_unit: 'pages',
    reminder_time: '10:00',
    start_date: format(subDays(today, 30), 'yyyy-MM-dd'),
    is_archived: false,
    is_active: true,
    created_at: format(subDays(today, 30), 'yyyy-MM-dd'),
  },
  {
    id: 'h-dsa',
    user_id: 'demo-user-123',
    name: 'DSA Practice',
    description: 'Solve 2 LeetCode problems or system design concepts',
    icon: 'Code',
    category: 'Study',
    accent_color: '#8B5CF6', // purple
    frequency_type: 'daily',
    frequency_days: [0, 1, 2, 3, 4, 5, 6],
    target_type: 'measurable',
    target_value: 60,
    target_unit: 'minutes',
    reminder_time: '18:00',
    start_date: format(subDays(today, 40), 'yyyy-MM-dd'),
    is_archived: false,
    is_active: true,
    created_at: format(subDays(today, 40), 'yyyy-MM-dd'),
  },
  {
    id: 'h-meditate',
    user_id: 'demo-user-123',
    name: 'Meditation',
    description: 'Mindfulness and breathing exercise',
    icon: 'Heart',
    category: 'Mindfulness',
    accent_color: '#F59E0B', // amber
    frequency_type: 'daily',
    frequency_days: [0, 1, 2, 3, 4, 5, 6],
    target_type: 'measurable',
    target_value: 15,
    target_unit: 'minutes',
    reminder_time: '21:00',
    start_date: format(subDays(today, 25), 'yyyy-MM-dd'),
    is_archived: false,
    is_active: true,
    created_at: format(subDays(today, 25), 'yyyy-MM-dd'),
  },
  {
    id: 'h-sleep',
    user_id: 'demo-user-123',
    name: 'Sleep 8 hours',
    description: 'Restful night sleep before 11 PM',
    icon: 'Moon',
    category: 'Health',
    accent_color: '#6366F1', // indigo
    frequency_type: 'daily',
    frequency_days: [0, 1, 2, 3, 4, 5, 6],
    target_type: 'measurable',
    target_value: 8,
    target_unit: 'hours',
    reminder_time: '23:00',
    start_date: format(subDays(today, 35), 'yyyy-MM-dd'),
    is_archived: false,
    is_active: true,
    created_at: format(subDays(today, 35), 'yyyy-MM-dd'),
  },
];

// Generate past 45 days of habit logs with consistent completions
export const generateInitialLogs = (): HabitLog[] => {
  const logs: HabitLog[] = [];
  const days = 45;

  for (let i = days; i >= 0; i--) {
    const dStr = format(subDays(today, i), 'yyyy-MM-dd');

    initialHabits.forEach(habit => {
      // Deterministic pseudo-random based on date & habit id for realistic stats
      const charCodeSum = habit.name.charCodeAt(0) + i;
      const isWeekend = new Date(dStr).getDay() === 0 || new Date(dStr).getDay() === 6;

      let completed = true;
      // Make weekends slightly less completed for workout, high for meditation
      if (habit.id === 'h-workout' && isWeekend) {
        completed = false;
      } else if (charCodeSum % 7 === 0) {
        completed = false;
      }

      // Ensure today has 78% completion (4 out of 6 completed)
      if (i === 0) {
        if (habit.id === 'h-meditate' || habit.id === 'h-sleep') {
          completed = false; // pending for tonight
        } else {
          completed = true;
        }
      }

      logs.push({
        id: `log-${habit.id}-${dStr}`,
        habit_id: habit.id,
        user_id: 'demo-user-123',
        log_date: dStr,
        completed,
        value: completed ? habit.target_value : 0,
        completed_at: completed ? `${dStr}T12:00:00Z` : undefined,
      });
    });
  }

  return logs;
};

export const initialGoals: Goal[] = [
  {
    id: 'g-1',
    user_id: 'demo-user-123',
    name: 'Become consistent with DSA',
    description: 'Solve problems daily to prepare for upcoming interviews',
    start_date: format(subDays(today, 30), 'yyyy-MM-dd'),
    end_date: format(subDays(today, -60), 'yyyy-MM-dd'),
    target_days: 90,
    habit_ids: ['h-dsa', 'h-read'],
    created_at: format(subDays(today, 30), 'yyyy-MM-dd'),
  },
  {
    id: 'g-2',
    user_id: 'demo-user-123',
    name: 'Improve Fitness & Health',
    description: 'Work out 5 days a week and maintain high hydration',
    start_date: format(subDays(today, 40), 'yyyy-MM-dd'),
    end_date: format(subDays(today, -20), 'yyyy-MM-dd'),
    target_days: 60,
    habit_ids: ['h-workout', 'h-water', 'h-sleep'],
    created_at: format(subDays(today, 40), 'yyyy-MM-dd'),
  },
  {
    id: 'g-3',
    user_id: 'demo-user-123',
    name: 'Read More Books',
    description: 'Complete 3 non-fiction books by reading 20 pages every single day',
    start_date: format(subDays(today, 15), 'yyyy-MM-dd'),
    end_date: format(subDays(today, -15), 'yyyy-MM-dd'),
    target_days: 30,
    habit_ids: ['h-read'],
    created_at: format(subDays(today, 15), 'yyyy-MM-dd'),
  },
];

export const initialAchievements: Achievement[] = [
  {
    id: 'first_streak',
    title: 'First Streak',
    description: 'Complete a habit for 3 consecutive days.',
    icon: 'Flame',
    requirement_type: 'streak',
    requirement_value: 3,
    unlocked_at: format(subDays(today, 35), 'yyyy-MM-dd'),
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak on any habit.',
    icon: 'ShieldCheck',
    requirement_type: 'streak',
    requirement_value: 7,
    unlocked_at: format(subDays(today, 20), 'yyyy-MM-dd'),
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Maintain a 30-day streak on any habit.',
    icon: 'Trophy',
    requirement_type: 'streak',
    requirement_value: 30,
    unlocked_at: format(subDays(today, 5), 'yyyy-MM-dd'),
  },
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'Complete 100% of your active habits in a single day.',
    icon: 'Sparkles',
    requirement_type: 'perfect_days',
    requirement_value: 1,
    unlocked_at: undefined, // locked
  },
  {
    id: 'consistent',
    title: 'Consistent Champion',
    description: 'Reach 90% monthly completion rate.',
    icon: 'Rocket',
    requirement_type: 'completions',
    requirement_value: 50,
    unlocked_at: undefined, // locked
  },
  {
    id: 'study_machine',
    title: 'Study Machine',
    description: 'Complete study habits for 30 days.',
    icon: 'BookOpen',
    requirement_type: 'completions',
    requirement_value: 30,
    unlocked_at: undefined, // locked
  },
];
