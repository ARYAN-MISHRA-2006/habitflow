import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../contexts/HabitContext';
import { calculateLevelFromXp } from '../utils/progressCalculations';
import { calculateOverallDailyStreak } from '../utils/streakCalculations';
import { Mail, Globe, Trophy } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { habits, habitLogs } = useHabits();

  const xp = user?.xp ?? 0;
  const levelInfo = calculateLevelFromXp(xp);

  const streak =
    calculateOverallDailyStreak(habits, habitLogs) ?? 0;

  const totalCompletions = habitLogs.filter(
    (log) => log.completed
  ).length;

  const displayName = user?.name?.trim() || 'User';
  const displayEmail = user?.email || '';
  const displayTimezone =
    user?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC';

  const avatarInitial =
    displayName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">

        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/20 shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-black text-3xl flex items-center justify-center shadow-lg">
            {avatarInitial}
          </div>
        )}

        <div className="text-center sm:text-left flex-1">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {displayName}
            </h1>

            {displayEmail && (
              <p className="text-xs font-medium text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Mail size={13} />
                <span>{displayEmail}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Globe size={14} className="text-slate-400" />
              <span>{displayTimezone}</span>
            </span>

            <span>•</span>

            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Trophy size={14} />
              Level {levelInfo.level}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {habits.length}
          </span>

          <span className="text-xs font-semibold text-slate-400 block mt-1">
            Total Habits
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold text-emerald-500">
            {totalCompletions}
          </span>

          <span className="text-xs font-semibold text-slate-400 block mt-1">
            Completions
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold text-amber-500">
            🔥 {streak}d
          </span>

          <span className="text-xs font-semibold text-slate-400 block mt-1">
            Current Streak
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
            {xp}
          </span>

          <span className="text-xs font-semibold text-slate-400 block mt-1">
            Total XP
          </span>
        </div>

      </div>
    </div>
  );
};