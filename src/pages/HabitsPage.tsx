import React, { useState } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { IconRenderer } from '../components/common/IconRenderer';
import { Plus, Search, Filter, Archive, Trash2, Edit3, Flame, Check } from 'lucide-react';
import { calculateHabitStreak } from '../utils/streakCalculations';
import { calculateHabitConsistency } from '../utils/progressCalculations';
import { getTodayString } from '../utils/dateUtils';

interface HabitsPageProps {
  onOpenAddHabit: () => void;
  onEditHabit: (habit: any) => void;
  onSelectHabit: (habitId: string) => void;
}

export const HabitsPage: React.FC<HabitsPageProps> = ({ onOpenAddHabit, onEditHabit, onSelectHabit }) => {
  const { habits, habitLogs, toggleHabitLog, deleteHabit, archiveHabit } = useHabits();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const todayStr = getTodayString();
  const categories = ['All', 'Health', 'Fitness', 'Study', 'Personal Growth', 'Mindfulness', 'Productivity'];

  const filteredHabits = habits.filter(h => {
    if (showArchived ? !h.is_archived : h.is_archived) return false;
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    if (searchTerm && !h.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Habits</h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Manage your active habits and schedules ({filteredHabits.length} habits)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
              showArchived
                ? 'bg-slate-800 text-white border-slate-800'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {showArchived ? 'Show Active' : 'View Archived'}
          </button>
          <button
            onClick={onOpenAddHabit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter habits..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHabits.map(habit => {
          const log = habitLogs.find(l => l.habit_id === habit.id && l.log_date === todayStr);
          const isCompleted = log ? log.completed : false;
          const streakData = calculateHabitStreak(habit, habitLogs);
          const consistency = calculateHabitConsistency(habit, habitLogs, 30);

          return (
            <div
              key={habit.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onSelectHabit(habit.id)}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold"
                      style={{ backgroundColor: `${habit.accent_color}18`, color: habit.accent_color }}
                    >
                      <IconRenderer name={habit.icon} size={22} color={habit.accent_color} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                        {habit.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">{habit.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleHabitLog(habit.id, todayStr)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isCompleted && <Check size={18} strokeWidth={3} />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center my-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Streak</span>
                    <span className="font-extrabold text-amber-500">🔥 {streakData.currentStreak}d</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Target</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{habit.target_value} {habit.target_unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Rate</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{consistency}%</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <button
                  onClick={() => onSelectHabit(habit.id)}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View Details →
                </button>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEditHabit(habit)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => archiveHabit(habit.id)} className="p-1 text-slate-400 hover:text-amber-500">
                    <Archive size={15} />
                  </button>
                  <button onClick={() => deleteHabit(habit.id)} className="p-1 text-slate-400 hover:text-rose-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
