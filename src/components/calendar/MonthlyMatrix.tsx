import React, { useState } from 'react';
import { useHabits } from '../../contexts/HabitContext';
import { getMonthDaysArray, getTodayString } from '../../utils/dateUtils';
import { IconRenderer } from '../common/IconRenderer';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const MonthlyMatrix: React.FC = () => {
  const { habits, habitLogs, toggleHabitLog } = useHabits();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const activeHabits = habits.filter(h => h.is_active && !h.is_archived);
  const daysArray = getMonthDaysArray(selectedYear, selectedMonth);
  const todayStr = getTodayString();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Habit Matrix</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Interactive spreadsheet overview for {monthNames[selectedMonth]} {selectedYear} ({daysArray.length} days)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white px-2">
            {monthNames[selectedMonth]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full border-collapse text-xs select-none">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-3 text-left font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 min-w-[160px]">
                Habit
              </th>
              {daysArray.map(d => (
                <th
                  key={d.dateString}
                  className={`p-2 text-center font-bold border-b border-slate-200 dark:border-slate-800 min-w-[34px] ${
                    d.dateString === todayStr
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                      : 'text-slate-400'
                  }`}
                >
                  <div>{d.dayNumber}</div>
                  <div className="text-[9px] uppercase font-normal">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.dayOfWeek]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeHabits.map(habit => (
              <tr key={habit.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2.5 min-w-[160px]">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${habit.accent_color}20`, color: habit.accent_color }}
                  >
                    <IconRenderer name={habit.icon} size={14} color={habit.accent_color} />
                  </div>
                  <span className="truncate">{habit.name}</span>
                </td>
                {daysArray.map(d => {
                  const log = habitLogs.find(l => l.habit_id === habit.id && l.log_date === d.dateString);
                  const isCompleted = log ? log.completed : false;
                  const isToday = d.dateString === todayStr;

                  return (
                    <td key={d.dateString} className="p-1 text-center">
                      <button
                        onClick={() => toggleHabitLog(habit.id, d.dateString)}
                        className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white font-bold shadow-sm scale-105'
                            : isToday
                            ? 'border-2 border-brand-500 bg-brand-50/30'
                            : 'border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                        }`}
                        title={`${habit.name} - ${d.dateString}: ${isCompleted ? 'Completed' : 'Not Completed'}`}
                      >
                        {isCompleted && <Check size={14} strokeWidth={3} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
