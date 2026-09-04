import React from 'react';
import { ProgressRing } from '../common/ProgressRing';
import { Flame, TrendingUp, Star } from 'lucide-react';
import { useHabits } from '../../contexts/HabitContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  calculateDailyProgress,
  calculateWeeklyAverage,
  calculateLevelFromXp,
} from '../../utils/progressCalculations';
import { calculateOverallDailyStreak } from '../../utils/streakCalculations';

export const SummaryCards: React.FC = () => {
  const { habits, habitLogs } = useHabits();
  const { user } = useAuth();

  const todaySummary = calculateDailyProgress(
    habits,
    habitLogs
  );

  const streakDays = calculateOverallDailyStreak(
    habits,
    habitLogs
  );

  const weeklyAvg = calculateWeeklyAverage(
    habits,
    habitLogs
  );

  const xp = user?.xp ?? 0;
  const levelInfo = calculateLevelFromXp(xp);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {/* 1. Today's Progress Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Today's Progress
          </span>

          <div className="mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {todaySummary.percentage}%
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {todaySummary.completedHabits} of {todaySummary.totalHabits} habits
          </p>
        </div>

        <ProgressRing
          percentage={todaySummary.percentage}
          size={72}
          strokeWidth={7}
          color="#10B981"
          showText={false}
        />
      </div>

      {/* 2. Current Streak Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Current Streak
          </span>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl">🔥</span>

            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {streakDays}{' '}
              <span className="text-base font-bold text-slate-500">
                days
              </span>
            </span>
          </div>

          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
            {streakDays > 0 ? 'Keep it going!' : 'Start your streak today!'}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Flame size={24} className={streakDays > 0 ? 'animate-bounce' : ''} />
        </div>
      </div>

      {/* 3. Weekly Average Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Weekly Average
          </span>

          <div className="mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {weeklyAvg}%
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            <TrendingUp size={13} />
            <span>
              {weeklyAvg > 0
                ? 'Keep building consistency'
                : 'No activity this week yet'}
            </span>
          </div>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* 4. Total XP / Level Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Total XP
          </span>

          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center">
            <Star size={16} fill="currentColor" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {xp.toLocaleString()}
          </span>

          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
            Level {levelInfo.level}
          </span>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-brand-500 rounded-full transition-all duration-500"
              style={{
                width: `${levelInfo.progressPercent}%`,
              }}
            />
          </div>

          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 text-right">
            {levelInfo.nextLevelXp - levelInfo.currentXp} XP to Level{' '}
            {levelInfo.level + 1}
          </p>
        </div>
      </div>
    </div>
  );
};