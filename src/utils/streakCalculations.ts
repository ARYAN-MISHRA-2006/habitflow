import { Habit, HabitLog } from '../types';
import { parseISO, subDays, format } from 'date-fns';
import { isScheduledDay, getTodayString } from './dateUtils';

export function calculateHabitStreak(
  habit: Habit,
  logs: HabitLog[],
  asOfDateStr: string = getTodayString()
): { currentStreak: number; longestStreak: number; totalCompletions: number } {
  // Filter logs for this habit and sort chronologically
  const habitLogs = logs.filter(l => l.habit_id === habit.id);
  const logMap = new Map<string, HabitLog>();
  habitLogs.forEach(l => logMap.set(l.log_date, l));

  const totalCompletions = habitLogs.filter(l => l.completed).length;

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let cursor = parseISO(asOfDateStr);

  // If today is scheduled and completed, start counting from today.
  // If today is scheduled but not completed yet, check if yesterday was completed.
  const todayStr = format(cursor, 'yyyy-MM-dd');
  const todayLog = logMap.get(todayStr);

  if (todayLog && todayLog.completed) {
    currentStreak++;
    cursor = subDays(cursor, 1);
  } else if (!isScheduledDay(todayStr, habit.frequency_type, habit.frequency_days)) {
    // Today is not a scheduled day, start checking backwards from yesterday
    cursor = subDays(cursor, 1);
  } else {
    // Today is scheduled but not completed yet. Check yesterday.
    const yesterdayStr = format(subDays(cursor, 1), 'yyyy-MM-dd');
    const yesterdayLog = logMap.get(yesterdayStr);
    if (yesterdayLog && yesterdayLog.completed) {
      cursor = subDays(cursor, 1);
    } else {
      // If yesterday wasn't completed and was scheduled, current streak is 0
      if (isScheduledDay(yesterdayStr, habit.frequency_type, habit.frequency_days)) {
        return { currentStreak: 0, longestStreak: calculateLongestStreak(habit, habitLogs), totalCompletions };
      }
    }
  }

  // Go backwards in time
  let maxSafetyCounter = 365 * 3; // 3 years max
  while (maxSafetyCounter > 0) {
    const dStr = format(cursor, 'yyyy-MM-dd');

    // Stop if before habit start date
    if (habit.start_date && dStr < habit.start_date) break;

    const scheduled = isScheduledDay(dStr, habit.frequency_type, habit.frequency_days);
    if (scheduled) {
      const log = logMap.get(dStr);
      if (log && log.completed) {
        currentStreak++;
      } else {
        // Scheduled day was missed -> streak breaks
        break;
      }
    }
    // If not scheduled, continue to previous day without incrementing or breaking
    cursor = subDays(cursor, 1);
    maxSafetyCounter--;
  }

  const longestStreak = Math.max(currentStreak, calculateLongestStreak(habit, habitLogs));
  return { currentStreak, longestStreak, totalCompletions };
}

function calculateLongestStreak(habit: Habit, habitLogs: HabitLog[]): number {
  if (habitLogs.length === 0) return 0;
  
  // Sort logs by date ascending
  const sorted = [...habitLogs].sort((a, b) => a.log_date.localeCompare(b.log_date));
  const logMap = new Map<string, boolean>();
  sorted.forEach(l => logMap.set(l.log_date, l.completed));

  let maxStreak = 0;
  let tempStreak = 0;

  if (sorted.length === 0) return 0;

  const minDate = parseISO(sorted[0].log_date);
  const maxDate = parseISO(getTodayString());

  let cursor = minDate;
  while (cursor <= maxDate) {
    const dStr = format(cursor, 'yyyy-MM-dd');
    if (isScheduledDay(dStr, habit.frequency_type, habit.frequency_days)) {
      const completed = logMap.get(dStr);
      if (completed) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    cursor = subDays(cursor, -1); // add 1 day
  }

  return maxStreak;
}

export function calculateOverallDailyStreak(habits: Habit[], logs: HabitLog[]): number {
  const activeHabits = habits.filter(h => h.is_active && !h.is_archived);
  if (activeHabits.length === 0) return 0;

  let streak = 0;
  let cursor = parseISO(getTodayString());

  // Check today first
  const todayStr = format(cursor, 'yyyy-MM-dd');
  const isTodayComplete = checkDayOverallCompletion(todayStr, activeHabits, logs);

  if (isTodayComplete) {
    streak++;
    cursor = subDays(cursor, 1);
  } else {
    // Check yesterday
    const yesterdayStr = format(subDays(cursor, 1), 'yyyy-MM-dd');
    if (checkDayOverallCompletion(yesterdayStr, activeHabits, logs)) {
      cursor = subDays(cursor, 1);
    } else {
      return 0;
    }
  }

  let limit = 365;
  while (limit > 0) {
    const dStr = format(cursor, 'yyyy-MM-dd');
    if (checkDayOverallCompletion(dStr, activeHabits, logs)) {
      streak++;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
    limit--;
  }

  return streak;
}

function checkDayOverallCompletion(dateStr: string, activeHabits: Habit[], logs: HabitLog[]): boolean {
  const scheduledToday = activeHabits.filter(h => isScheduledDay(dateStr, h.frequency_type, h.frequency_days));
  if (scheduledToday.length === 0) return true; // No habits scheduled today

  const completedCount = scheduledToday.filter(h => {
    const log = logs.find(l => l.habit_id === h.id && l.log_date === dateStr);
    return log && log.completed;
  }).length;

  return completedCount > 0 && completedCount / scheduledToday.length >= 0.75;
}
