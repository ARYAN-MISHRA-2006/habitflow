import React, { useState } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { useAuth } from '../contexts/AuthContext';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { calculateLevelFromXp } from '../utils/progressCalculations';
import { Trophy, Star, Sparkles } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { achievements } = useHabits();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const levelInfo = calculateLevelFromXp(user?.xp || 1240);

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return Boolean(a.unlocked_at);
    if (filter === 'locked') return !a.unlocked_at;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Achievements & XP</h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Earn XP by completing habits and unlock badges as you build consistency
        </p>
      </div>

      {/* Level Progress Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30 shrink-0">
            <Trophy size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Level {levelInfo.level}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center gap-1">
                <Star size={12} fill="currentColor" /> {user?.xp || 1240} Total XP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Complete habits daily to gain +10 XP per completion and +50 XP for perfect days!
            </p>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="w-full md:w-72">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600 dark:text-slate-300">Level {levelInfo.level}</span>
            <span className="text-brand-600 dark:text-brand-400">
              {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'unlocked', 'locked'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === tab
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Achievements Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};
