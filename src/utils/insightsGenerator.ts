import { Habit, HabitLog, UserInsight } from '../types';
import { calculateHabitConsistency } from './progressCalculations';
import { parseISO, getDay, format } from 'date-fns';
import { getLastNDays } from './dateUtils';

export function generateUserInsights(habits: Habit[], logs: HabitLog[]): UserInsight[] {
  const activeHabits = habits.filter(h => h.is_active && !h.is_archived);
  
  if (activeHabits.length === 0 || logs.length < 5) {
    return [
      {
        id: 'ins_welcome',
        type: 'info',
        title: 'Start Tracking Today',
        description: 'Keep logging your daily habits for a few more days to unlock personalized consistency insights!',
      }
    ];
  }

  const insights: UserInsight[] = [];

  // 1. Best Performing Habit
  let bestHabit: Habit | null = null;
  let bestRate = -1;

  activeHabits.forEach(h => {
    const rate = calculateHabitConsistency(h, logs, 30);
    if (rate > bestRate) {
      bestRate = rate;
      bestHabit = h;
    }
  });

  if (bestHabit && bestRate > 0) {
    insights.push({
      id: 'ins_best_habit',
      type: 'positive',
      title: 'Top Performing Habit',
      description: `Your "${(bestHabit as Habit).name}" habit has a ${bestRate}% completion rate over the last 30 days!`,
      metric: `${bestRate}%`,
    });
  }

  // 2. Day of Week Analysis (Best & Weakest day)
  const dayStats: { [dayIndex: number]: { total: number; completed: number } } = {
    0: { total: 0, completed: 0 },
    1: { total: 0, completed: 0 },
    2: { total: 0, completed: 0 },
    3: { total: 0, completed: 0 },
    4: { total: 0, completed: 0 },
    5: { total: 0, completed: 0 },
    6: { total: 0, completed: 0 },
  };

  const days30 = getLastNDays(30);
  days30.forEach(dStr => {
    const dayOfWeek = getDay(parseISO(dStr));
    const dayLogs = logs.filter(l => l.log_date === dStr);
    dayLogs.forEach(l => {
      dayStats[dayOfWeek].total++;
      if (l.completed) dayStats[dayOfWeek].completed++;
    });
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDayIndex = -1;
  let bestDayRate = -1;
  let worstDayIndex = -1;
  let worstDayRate = 999;

  Object.entries(dayStats).forEach(([dayIdxStr, stat]) => {
    if (stat.total >= 3) {
      const rate = (stat.completed / stat.total) * 100;
      if (rate > bestDayRate) {
        bestDayRate = rate;
        bestDayIndex = Number(dayIdxStr);
      }
      if (rate < worstDayRate) {
        worstDayRate = rate;
        worstDayIndex = Number(dayIdxStr);
      }
    }
  });

  if (bestDayIndex !== -1 && bestDayRate > 0) {
    insights.push({
      id: 'ins_best_day',
      type: 'positive',
      title: 'Peak Productivity Day',
      description: `You are most consistent on ${dayNames[bestDayIndex]}s with a ${Math.round(bestDayRate)}% completion rate.`,
      metric: dayNames[bestDayIndex],
    });
  }

  if (worstDayIndex !== -1 && worstDayRate < 70 && worstDayIndex !== bestDayIndex) {
    insights.push({
      id: 'ins_weak_day',
      type: 'warning',
      title: 'Potential Opportunity',
      description: `You tend to miss the most habits on ${dayNames[worstDayIndex]}s. Consider scheduling lighter targets on this day.`,
      metric: dayNames[worstDayIndex],
    });
  }

  // 3. Weekly Trend Improvement
  const first15 = days30.slice(0, 15);
  const last15 = days30.slice(15);

  const calcPeriodRate = (dates: string[]) => {
    let total = 0;
    let completed = 0;
    dates.forEach(d => {
      logs.filter(l => l.log_date === d).forEach(l => {
        total++;
        if (l.completed) completed++;
      });
    });
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const first15Rate = calcPeriodRate(first15);
  const last15Rate = calcPeriodRate(last15);
  const diff = Math.round(last15Rate - first15Rate);

  if (diff > 5) {
    insights.push({
      id: 'ins_trend_up',
      type: 'positive',
      title: 'Consistency Spike',
      description: `Your completion rate improved by ${diff}% over the last 2 weeks! Keep building momentum.`,
      metric: `+${diff}%`,
    });
  } else if (diff < -10) {
    insights.push({
      id: 'ins_trend_down',
      type: 'warning',
      title: 'Consistency Shift',
      description: `Your consistency dropped by ${Math.abs(diff)}% recently. Revisit your goals and reset your streak!`,
      metric: `${diff}%`,
    });
  }

  return insights;
}
