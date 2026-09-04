import React from 'react';
import { Achievement } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { Lock, CheckCircle2 } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const isUnlocked = Boolean(achievement.unlocked_at);

  return (
    <div
      className={`rounded-3xl p-5 border transition-all ${
        isUnlocked
          ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
          : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-transform ${
            isUnlocked
              ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
          }`}
        >
          {isUnlocked ? <IconRenderer name={achievement.icon} size={24} /> : <Lock size={22} />}
        </div>

        {isUnlocked ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={12} />
            <span>Unlocked</span>
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            Locked
          </span>
        )}
      </div>

      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{achievement.title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{achievement.description}</p>
    </div>
  );
};
