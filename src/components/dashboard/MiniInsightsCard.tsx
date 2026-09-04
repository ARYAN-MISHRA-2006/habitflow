import React from 'react';
import { Lightbulb, ArrowRight, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useHabits } from '../../contexts/HabitContext';
import { generateUserInsights } from '../../utils/insightsGenerator';

export const MiniInsightsCard: React.FC<{ onNavigateToInsights: () => void }> = ({ onNavigateToInsights }) => {
  const { habits, habitLogs } = useHabits();
  const insights = generateUserInsights(habits, habitLogs);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Insights</h3>
        </div>
        <button
          onClick={onNavigateToInsights}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-2.5">
        {insights.slice(0, 3).map(item => (
          <div
            key={item.id}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 text-xs"
          >
            {item.type === 'positive' && <TrendingUp size={15} className="text-emerald-500 mt-0.5 shrink-0" />}
            {item.type === 'warning' && <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />}
            {item.type === 'info' && <Calendar size={15} className="text-brand-500 mt-0.5 shrink-0" />}
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
