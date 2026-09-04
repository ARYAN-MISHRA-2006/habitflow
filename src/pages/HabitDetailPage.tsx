import React from 'react';
import { useHabits } from '../contexts/HabitContext';
import { IconRenderer } from '../components/common/IconRenderer';
import { ArrowLeft, Flame, Trophy, CheckCircle2, Calendar, Edit3, Trash2 } from 'lucide-react';
import { calculateHabitStreak } from '../utils/streakCalculations';
import { calculateHabitConsistency } from '../utils/progressCalculations';
import { getMonthDaysArray, getTodayString } from '../utils/dateUtils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getLastNDays, formatDateDisplay } from '../utils/dateUtils';

interface HabitDetailPageProps {
  habitId: string;
  onBack: () => void;
  onEditHabit: (habit: any) => void;
}

export const HabitDetailPage: React.FC<HabitDetailPageProps> = ({ habitId, onBack, onEditHabit }) => {
  const { habits, habitLogs, toggleHabitLog, deleteHabit } = useHabits();
  const habit = habits.find(h => h.id === habitId);

  if (!habit) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-semibold text-slate-500">Habit not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const streakData = calculateHabitStreak(habit, habitLogs);
  const consistencyRate = calculateHabitConsistency(habit, habitLogs, 30);
  const today = new Date();
  const daysArray = getMonthDaysArray(today.getFullYear(), today.getMonth());
  const todayStr = getTodayString();

  // Chart data for past 30 days
  const last30Days = getLastNDays(30);
  const chartData = last30Days.map(dStr => {
    const log = habitLogs.find(l => l.habit_id === habit.id && l.log_date === dStr);
    return {
      date: formatDateDisplay(dStr, 'MMM d'),
      value: log && log.completed ? habit.target_value : 0,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditHabit(habit)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => { deleteHabit(habit.id); onBack(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Habit Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center font-bold shadow-sm"
            style={{ backgroundColor: `${habit.accent_color}20`, color: habit.accent_color }}
          >
            <IconRenderer name={habit.icon} size={32} color={habit.accent_color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{habit.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                {habit.category}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Target: {habit.target_value} {habit.target_unit} • {habit.frequency_type} schedule
            </p>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-amber-600 uppercase block">Current Streak</span>
            <span className="text-lg font-extrabold text-amber-500">🔥 {streakData.currentStreak}d</span>
          </div>
          <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/50 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-brand-600 uppercase block">Longest Streak</span>
            <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">🏆 {streakData.longestStreak}d</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">30-Day Rate</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{consistencyRate}%</span>
          </div>
        </div>
      </div>

      {/* Chart & Calendar Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Past 30 Days Trend</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={habit.accent_color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={habit.accent_color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke={habit.accent_color} strokeWidth={3} fill="url(#habitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Month Calendar History Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">This Month's Activity</h3>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {daysArray.map(d => {
              const log = habitLogs.find(l => l.habit_id === habit.id && l.log_date === d.dateString);
              const isCompleted = log ? log.completed : false;

              return (
                <button
                  key={d.dateString}
                  onClick={() => toggleHabitLog(habit.id, d.dateString)}
                  className={`h-10 rounded-xl flex flex-col items-center justify-center font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : d.dateString === todayStr
                      ? 'border-2 border-brand-500 text-brand-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <span>{d.dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
