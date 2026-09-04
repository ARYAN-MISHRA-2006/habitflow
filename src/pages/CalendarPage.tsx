import React, { useState } from 'react';
import { MonthlyMatrix } from '../components/calendar/MonthlyMatrix';
import { DayDetailsModal } from '../components/calendar/DayDetailsModal';
import { useHabits } from '../contexts/HabitContext';
import { getMonthDaysArray, getTodayString, formatDateDisplay } from '../utils/dateUtils';
import { calculateDailyProgress } from '../utils/progressCalculations';
import { ChevronLeft, ChevronRight, Grid, Calendar as CalendarIcon } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { habits, habitLogs, toggleHabitLog } = useHabits();
  const [viewMode, setViewMode] = useState<'matrix' | 'calendar'>('matrix');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = getMonthDaysArray(selectedYear, selectedMonth);
  const todayStr = getTodayString();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Calendar & History</h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Track daily completions and monthly consistency heatmaps
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'matrix'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Grid size={15} />
            <span>Monthly Matrix</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarIcon size={15} />
            <span>Heatmap Grid</span>
          </button>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <MonthlyMatrix />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMonth(prev => (prev === 0 ? 11 : prev - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setSelectedMonth(prev => (prev === 11 ? 0 : prev + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
              <div key={w} className="font-extrabold text-slate-400 py-1">{w}</div>
            ))}

            {days.map(d => {
              const summary = calculateDailyProgress(habits, habitLogs, d.dateString);
              const isToday = d.dateString === todayStr;

              let intensity = 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
              if (summary.percentage === 100) intensity = 'bg-emerald-500 text-white font-bold';
              else if (summary.percentage >= 75) intensity = 'bg-emerald-400 text-white font-bold';
              else if (summary.percentage >= 50) intensity = 'bg-emerald-300/80 dark:bg-emerald-800 text-white font-bold';
              else if (summary.percentage > 0) intensity = 'bg-emerald-100 dark:bg-emerald-950 font-bold';

              return (
                <div
                  key={d.dateString}
                  onClick={() => setSelectedDate(d.dateString)}
                  className={`h-14 rounded-2xl p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 ${intensity} ${
                    isToday ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                  }`}
                >
                  <span className="text-left font-bold">{d.dayNumber}</span>
                  {summary.totalHabits > 0 && (
                    <span className="text-[10px] text-right font-extrabold">{summary.percentage}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Details Modal */}
      <DayDetailsModal
        dateStr={selectedDate}
        onClose={() => setSelectedDate(null)}
        habits={habits}
        logs={habitLogs}
        onToggleHabit={toggleHabitLog}
      />
    </div>
  );
};
