import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthDaysArray, getTodayString } from '../../utils/dateUtils';
import { useHabits } from '../../contexts/HabitContext';
import { calculateDailyProgress } from '../../utils/progressCalculations';

export const MiniCalendarCard: React.FC<{ onNavigateToCalendar: () => void }> = ({ onNavigateToCalendar }) => {
  const { habits, habitLogs } = useHabits();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const days = getMonthDaysArray(year, month);
  const todayStr = getTodayString();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Month Title & Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onNavigateToCalendar} className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600">
          September 2026
        </button>
        <div className="flex items-center gap-1 text-slate-400">
          <button onClick={onNavigateToCalendar} className="p-1 hover:text-slate-700 dark:hover:text-white">
            <ChevronLeft size={16} />
          </button>
          <button onClick={onNavigateToCalendar} className="p-1 hover:text-slate-700 dark:hover:text-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map(d => {
          const summary = calculateDailyProgress(habits, habitLogs, d.dateString);
          const isToday = d.dateString === todayStr;

          let bgClass = 'text-slate-700 dark:text-slate-300';
          if (summary.percentage === 100) {
            bgClass = 'bg-emerald-500 text-white font-bold rounded-lg';
          } else if (summary.percentage >= 75) {
            bgClass = 'bg-emerald-400/80 text-white font-bold rounded-lg';
          } else if (summary.percentage >= 50) {
            bgClass = 'bg-emerald-300/60 dark:bg-emerald-900/60 font-semibold rounded-lg';
          } else if (summary.percentage > 0) {
            bgClass = 'bg-emerald-100 dark:bg-emerald-950 font-medium rounded-lg';
          }

          if (isToday) {
            bgClass += ' ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900';
          }

          return (
            <div
              key={d.dateString}
              onClick={onNavigateToCalendar}
              className={`h-8 flex items-center justify-center cursor-pointer transition-all ${bgClass}`}
            >
              {d.dayNumber}
            </div>
          );
        })}
      </div>

      {/* Color Heatmap Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-400">
        <span>0%</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-800 border"></span>
          <span className="w-2.5 h-2.5 rounded bg-emerald-100 dark:bg-emerald-950"></span>
          <span className="w-2.5 h-2.5 rounded bg-emerald-300/60"></span>
          <span className="w-2.5 h-2.5 rounded bg-emerald-400"></span>
          <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
        </div>
        <span>100%</span>
      </div>
    </div>
  );
};
