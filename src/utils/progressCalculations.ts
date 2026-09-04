import { Habit, HabitLog, DailySummary } from '../types';
import { isScheduledDay, getTodayString, getWeekDays, getLastNDays } from './dateUtils';

export function calculateDailyProgress(
  habits: Habit[], 
  logs: HabitLog[], 
  dateStr: string = getTodayString()
): DailySummary {
  const activeHabits = habits.filter(h => h.is_active && !h.is_archived);
  const scheduledHabits = activeHabits.filter(h => isScheduledDay(dateStr, h.frequency_type, h.frequency_days));

  if (scheduledHabits.length === 0) {
    return {
      date: dateStr,
      totalHabits: 0,
      completedHabits: 0,
      percentage: 0,
      earnedXp: 0,
    };
  }

  let completedCount = 0;
  scheduledHabits.forEach(h => {
    const log = logs.find(l => l.habit_id === h.id && l.log_date === dateStr);
    if (log && log.completed) {
      completedCount++;
    }
  });

  const percentage = Math.round((completedCount / scheduledHabits.length) * 100);
  const earnedXp = completedCount * 10 + (percentage === 100 ? 50 : 0);

  return {
    date: dateStr,
    totalHabits: scheduledHabits.length,
    completedHabits: completedCount,
    percentage,
    earnedXp,
  };
}

export function calculateWeeklyAverage(habits: Habit[], logs: HabitLog[]): number {
  const weekDays = getWeekDays();
  let totalPercentage = 0;
  let validDays = 0;

  weekDays.forEach(d => {
    const summary = calculateDailyProgress(habits, logs, d);
    if (summary.totalHabits > 0) {
      totalPercentage += summary.percentage;
      validDays++;
    }
  });

  return validDays > 0 ? Math.round(totalPercentage / validDays) : 0;
}

export function calculateHabitConsistency(
  habit: Habit, 
  logs: HabitLog[], 
  daysCount: number = 30
): number {
  const dates = getLastNDays(daysCount);
  let scheduledDaysCount = 0;
  let completedDaysCount = 0;

  const habitLogsMap = new Map<string, boolean>();
  logs.filter(l => l.habit_id === habit.id).forEach(l => habitLogsMap.set(l.log_date, l.completed));

  dates.forEach(d => {
    if (isScheduledDay(d, habit.frequency_type, habit.frequency_days)) {
      scheduledDaysCount++;
      if (habitLogsMap.get(d)) {
        completedDaysCount++;
      }
    }
  });

  return scheduledDaysCount > 0 ? Math.round((completedDaysCount / scheduledDaysCount) * 100) : 0;
}

export function calculateLevelFromXp(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPercent: number } {
  // XP formula: Level L requires L * 150 XP
  let level = 1;
  let accumulatedXp = 0;

  while (true) {
    const xpForNext = level * 150;
    if (xp >= accumulatedXp + xpForNext) {
      accumulatedXp += xpForNext;
      level++;
    } else {
      const currentXp = xp - accumulatedXp;
      const progressPercent = Math.min(100, Math.round((currentXp / xpForNext) * 100));
      return {
        level,
        currentXp,
        nextLevelXp: xpForNext,
        progressPercent,
      };
    }
  }
}
