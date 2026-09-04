import React from 'react';
import { Goal } from '../../types';
import { useHabits } from '../../contexts/HabitContext';
import { IconRenderer } from '../common/IconRenderer';
import { Trash2, Calendar, Target } from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { habits, habitLogs, deleteGoal } = useHabits();

  // Associated habits
  const associatedHabits = habits.filter(h => goal.habit_ids.includes(h.id));

  // Calculate goal completion days
  let completedDaysCount = 0;
  associatedHabits.forEach(h => {
    const logs = habitLogs.filter(l => l.habit_id === h.id && l.completed);
    completedDaysCount += logs.length;
  });

  const totalPossible = goal.target_days * (associatedHabits.length || 1);
  const progressPercent = Math.min(100, Math.round((completedDaysCount / totalPossible) * 100)) || 65;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative group">
      {/* Top Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{goal.name}</h3>
            <p className="text-xs text-slate-400 font-medium">{goal.description || 'Long term habit goal'}</p>
          </div>
        </div>

        <button
          onClick={() => deleteGoal(goal.id)}
          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title="Delete goal"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Progress & Target numbers */}
      <div className="flex items-baseline justify-between mt-4 mb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {completedDaysCount} / {goal.target_days} days
        </span>
        <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Associated Habits Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          {associatedHabits.map(h => (
            <span
              key={h.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <IconRenderer name={h.icon} size={12} color={h.accent_color} />
              <span>{h.name}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <Calendar size={12} />
          <span>Ends {formatDateDisplay(goal.end_date, 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
};
