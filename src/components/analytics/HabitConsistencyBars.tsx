import React from 'react';
import { useHabits } from '../../contexts/HabitContext';
import { calculateHabitConsistency } from '../../utils/progressCalculations';
import { IconRenderer } from '../common/IconRenderer';

export const HabitConsistencyBars: React.FC = () => {
  const { habits, habitLogs } = useHabits();
  const activeHabits = habits.filter(h => h.is_active && !h.is_archived);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Habit Consistency</h3>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-5">30-day completion rate comparison</p>

      <div className="space-y-4">
        {activeHabits.map(habit => {
          const consistency = calculateHabitConsistency(habit, habitLogs, 30);
          return (
            <div key={habit.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <IconRenderer name={habit.icon} size={15} color={habit.accent_color} />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{habit.name}</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{consistency}%</span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${consistency}%`,
                    backgroundColor: habit.accent_color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
