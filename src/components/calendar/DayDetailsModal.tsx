import React from 'react';
import { X, Check, Clock, Sparkles } from 'lucide-react';
import { Habit, HabitLog } from '../../types';
import { formatDateDisplay } from '../../utils/dateUtils';
import { IconRenderer } from '../common/IconRenderer';

interface DayDetailsModalProps {
  dateStr: string | null;
  onClose: () => void;
  habits: Habit[];
  logs: HabitLog[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  dateStr,
  onClose,
  habits,
  logs,
  onToggleHabit,
}) => {
  if (!dateStr) return null;

  const activeHabits = habits.filter(h => h.is_active && !h.is_archived);
  const dayLogs = logs.filter(l => l.log_date === dateStr);

  const completedCount = dayLogs.filter(l => l.completed).length;
  const percentage = activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;
  const earnedXp = completedCount * 10 + (percentage === 100 ? 50 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatDateDisplay(dateStr, 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{percentage}% Completed</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                <Sparkles size={13} /> +{earnedXp} XP
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Habits Checklist for Selected Day */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {activeHabits.map(habit => {
            const log = dayLogs.find(l => l.habit_id === habit.id);
            const isCompleted = log ? log.completed : false;

            return (
              <div
                key={habit.id}
                onClick={() => onToggleHabit(habit.id, dateStr)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${habit.accent_color}18`, color: habit.accent_color }}
                  >
                    <IconRenderer name={habit.icon} size={18} color={habit.accent_color} />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {habit.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">{habit.category}</p>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isCompleted && <Check size={16} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
