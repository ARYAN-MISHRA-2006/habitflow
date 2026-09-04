import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useHabits } from '../../contexts/HabitContext';
import { calculateDailyProgress } from '../../utils/progressCalculations';
import { getLastNDays, formatDateDisplay } from '../../utils/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';

export const DailyProgressChart: React.FC = () => {
  const { habits, habitLogs } = useHabits();
  const { isDarkMode } = useTheme();
  const [rangeDays, setRangeDays] = useState<number>(7);

  const dateStrings = getLastNDays(rangeDays);
  const chartData = dateStrings.map(dStr => {
    const summary = calculateDailyProgress(habits, habitLogs, dStr);
    return {
      date: formatDateDisplay(dStr, rangeDays <= 7 ? 'MMM d' : 'MMM d'),
      fullDate: dStr,
      percentage: summary.percentage,
      completed: summary.completedHabits,
      total: summary.totalHabits,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Progress</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Completion trend over time</p>
        </div>
        <select
          value={rangeDays}
          onChange={e => setRangeDays(Number(e.target.value))}
          className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-brand-500"
        >
          <option value={7}>Last 7 Days</option>
          <option value={14}>Last 14 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      <div className="h-48 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke={isDarkMode ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
              stroke={isDarkMode ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white dark:bg-slate-800 p-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
                      <p className="font-bold">{data.date}</p>
                      <p className="text-emerald-400 font-semibold mt-0.5">{data.percentage}% Completed</p>
                      <p className="text-slate-400 text-[11px]">{data.completed} of {data.total} habits</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
