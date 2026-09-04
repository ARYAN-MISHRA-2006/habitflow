import React, { useState, useEffect } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { generateUserInsights } from '../utils/insightsGenerator';
import { fetchAIInsights } from '../lib/aiInsightService';
import { Lightbulb, Sparkles, TrendingUp, AlertCircle, Calendar, Bot } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { habits, habitLogs } = useHabits();
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(true);

  const empiricalInsights = generateUserInsights(habits, habitLogs);

  useEffect(() => {
    fetchAIInsights({ habits, logs: habitLogs }).then(res => {
      setAiAnalysis(res.aiAnalysisText);
      setLoadingAi(false);
    });
  }, [habits, habitLogs]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Personal Insights</h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Smart pattern analysis generated from your real habit completion logs
        </p>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-br from-brand-600 to-teal-500 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold flex items-center gap-1.5">
              <span>AI Habit Coach Analysis</span>
              <Sparkles size={16} className="text-amber-300 animate-pulse" />
            </h2>
            <p className="text-xs text-white/80 font-medium">Automated routine optimization & behavioral feedback</p>
          </div>
        </div>

        {loadingAi ? (
          <div className="py-4 text-xs font-semibold animate-pulse text-white/90">
            Analyzing your consistency trends across 45 days...
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-xs leading-relaxed space-y-1 border border-white/10">
            <p className="whitespace-pre-line font-medium text-white/95">{aiAnalysis}</p>
          </div>
        )}
      </div>

      {/* Calculated Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empiricalInsights.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                item.type === 'positive'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : item.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-brand-500/10 text-brand-500'
              }`}
            >
              {item.type === 'positive' && <TrendingUp size={20} />}
              {item.type === 'warning' && <AlertCircle size={20} />}
              {item.type === 'info' && <Calendar size={20} />}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                {item.metric && (
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                    {item.metric}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
