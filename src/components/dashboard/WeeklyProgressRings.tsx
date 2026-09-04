import React from 'react';
import { ProgressRing } from '../common/ProgressRing';
import { useHabits } from '../../contexts/HabitContext';

export const WeeklyProgressRings: React.FC = () => {
  const { habits, habitLogs } = useHabits();

  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  // Number of days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create calendar weeks for the current month.
  // Week 1 = days 1–7, Week 2 = 8–14, etc.
  const weeks = [];

  for (let startDay = 1; startDay <= daysInMonth; startDay += 7) {
    const endDay = Math.min(startDay + 6, daysInMonth);

    weeks.push({
      startDay,
      endDay,
    });
  }

  const activeHabits = habits.filter(
    habit => !habit.is_archived
  );

  const getDateString = (day: number) => {
    const monthString = String(month + 1).padStart(2, '0');
    const dayString = String(day).padStart(2, '0');

    return `${year}-${monthString}-${dayString}`;
  };

  const weeklyData = weeks.map((week, index) => {
    let expectedCompletions = 0;
    let completedCompletions = 0;

    for (
      let day = week.startDay;
      day <= week.endDay;
      day++
    ) {
      const date = new Date(year, month, day);

      // Don't count future dates.
      if (date > today) {
        continue;
      }

      const dateString = getDateString(day);

      activeHabits.forEach(habit => {
        // Don't count a habit before it was created.
        if (habit.created_at) {
          const createdDate = new Date(habit.created_at);

          if (createdDate > date) {
            return;
          }
        }

        expectedCompletions++;

        const completed = habitLogs.some(
          log =>
            log.habit_id === habit.id &&
            log.log_date === dateString &&
            log.completed
        );

        if (completed) {
          completedCompletions++;
        }
      });
    }

    const percentage =
      expectedCompletions > 0
        ? Math.round(
            (completedCompletions / expectedCompletions) * 100
          )
        : 0;

    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
    ];

    return {
      label: `Week ${index + 1}`,
      percentage,
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
        Weekly Progress
      </h3>

      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-5">
        Monthly breakdown by week
      </p>

      <div
        className={`grid grid-cols-2 ${
          weeklyData.length >= 5
            ? 'sm:grid-cols-5'
            : 'sm:grid-cols-4'
        } gap-4 text-center`}
      >
        {weeklyData.map(week => (
          <div
            key={week.label}
            className="flex flex-col items-center p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30"
          >
            <ProgressRing
              percentage={week.percentage}
              size={64}
              strokeWidth={6}
              color={week.color}
              showText={true}
            />

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
              {week.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[11px] font-semibold italic text-slate-500 dark:text-slate-400">
          "Consistency isn't perfection. It's showing up, again and again."
        </p>
      </div>
    </div>
  );
};