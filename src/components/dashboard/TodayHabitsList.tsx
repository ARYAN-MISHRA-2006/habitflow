import React from 'react';
import { IconRenderer } from '../common/IconRenderer';
import { Check, Plus, Flame, Clock } from 'lucide-react';
import { useHabits } from '../../contexts/HabitContext';
import { calculateHabitStreak } from '../../utils/streakCalculations';
import { getTodayString } from '../../utils/dateUtils';
import { motion } from 'framer-motion';

interface TodayHabitsListProps {
  onOpenAddHabit: () => void;
  onSelectHabit?: (habitId: string) => void;
}

export const TodayHabitsList: React.FC<TodayHabitsListProps> = ({ onOpenAddHabit, onSelectHabit }) => {
  const { habits, habitLogs, toggleHabitLog } = useHabits();
  const todayStr = getTodayString();

  const activeHabits = habits.filter(h => h.is_active && !h.is_archived);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Habits</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Track and complete your daily goals</p>
        </div>
        <button
          onClick={onOpenAddHabit}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Habits Items Container */}
      {activeHabits.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
            <Plus size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your journey starts here.</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-4">
            You don't have any habits yet. Create your first habit to begin building consistency!
          </p>
          <button
            onClick={onOpenAddHabit}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20"
          >
            + Create your first habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeHabits.map(habit => {
            const log = habitLogs.find(l => l.habit_id === habit.id && l.log_date === todayStr);
            const isCompleted = log ? log.completed : false;
            const streakData = calculateHabitStreak(habit, habitLogs);

            return (
              <motion.div
                key={habit.id}
                whileHover={{ scale: 1.005 }}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-900'
                }`}
              >
                {/* Left: Icon & Title info */}
                <div
                  className="flex items-center gap-3.5 flex-1 cursor-pointer"
                  onClick={() => onSelectHabit && onSelectHabit(habit.id)}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform"
                    style={{
                      backgroundColor: `${habit.accent_color}18`,
                      color: habit.accent_color,
                    }}
                  >
                    <IconRenderer name={habit.icon} size={22} color={habit.accent_color} />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold transition-colors ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>
                        {habit.target_value} {habit.target_unit}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{habit.category}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Scheduled time, Streak & Completion Toggle */}
                <div className="flex items-center gap-4">
                  {habit.reminder_time && (
                    <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      <Clock size={12} />
                      <span>{habit.reminder_time}</span>
                    </div>
                  )}

                  {streakData.currentStreak > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Flame size={14} className="fill-amber-500" />
                      <span>{streakData.currentStreak}d</span>
                    </div>
                  )}

                  {/* Completion Checkbox / Button */}
                  <button
                    onClick={() => toggleHabitLog(habit.id, todayStr)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
                        : 'border-2 border-slate-300 dark:border-slate-700 hover:border-brand-500 text-transparent'
                    }`}
                    aria-label={`Mark ${habit.name} complete`}
                  >
                    <Check size={18} strokeWidth={3} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Mobile Add Button Banner */}
      <div className="mt-4 sm:hidden">
        <button
          onClick={onOpenAddHabit}
          className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Add Habit</span>
        </button>
      </div>
    </div>
  );
};
