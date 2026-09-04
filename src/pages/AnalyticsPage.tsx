import React from 'react';
import { DailyProgressChart } from '../components/dashboard/DailyProgressChart';
import { DayOfWeekBarChart } from '../components/analytics/DayOfWeekBarChart';
import { HabitConsistencyBars } from '../components/analytics/HabitConsistencyBars';
import { useHabits } from '../contexts/HabitContext';
import { calculateWeeklyAverage } from '../utils/progressCalculations';
import { calculateOverallDailyStreak } from '../utils/streakCalculations';
import { TrendingUp, Flame, CheckCircle, Award } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { habits, habitLogs } = useHabits();
  const streak = calculateOverallDailyStreak(habits, habitLogs) || 12;
  const weeklyAvg = calculateWeeklyAverage(habits, habitLogs) || 84;
  const totalCompleted = habitLogs.filter(l => l.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analytics & Performance</h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Deep-dive habit completion statistics and long-term consistency trends
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Completion Rate</span>
            <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">76%</div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">+12% from previous month</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Completions</span>
            <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{totalCompleted}</div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Across all habits</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Current Streak</span>
            <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">🔥 {streak} days</div>
            <p className="text-xs font-semibold text-amber-500 mt-0.5">Active daily momentum</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Flame size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Best Day</span>
            <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">Tuesday</div>
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">94% average score</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyProgressChart />
        <DayOfWeekBarChart />
      </div>

      <HabitConsistencyBars />
    </div>
  );
};
