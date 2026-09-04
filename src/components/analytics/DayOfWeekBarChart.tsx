import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useHabits } from '../../contexts/HabitContext';
import { getDay, parseISO } from 'date-fns';
import { getLastNDays } from '../../utils/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';

export const DayOfWeekBarChart: React.FC = () => {
  const { habitLogs } = useHabits();
  const { isDarkMode } = useTheme();

  const dayStats: { [dayIdx: number]: { total: number; completed: number } } = {
    1: { total: 0, completed: 0 }, // Mon
    2: { total: 0, completed: 0 }, // Tue
    3: { total: 0, completed: 0 }, // Wed
    4: { total: 0, completed: 0 }, // Thu
    5: { total: 0, completed: 0 }, // Fri
    6: { total: 0, completed: 0 }, // Sat
    0: { total: 0, completed: 0 }, // Sun
  };

  const days30 = getLastNDays(30);
  days30.forEach(dStr => {
    const dayOfWeek = getDay(parseISO(dStr));
    const logs = habitLogs.filter(l => l.log_date === dStr);
    logs.forEach(l => {
      dayStats[dayOfWeek].total++;
      if (l.completed) dayStats[dayOfWeek].completed++;
    });
  });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayIndices = [1, 2, 3, 4, 5, 6, 0];

  const data = dayNames.map((name, idx) => {
    const dayIdx = dayIndices[idx];
    const stat = dayStats[dayIdx];
    const percentage = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 75;
    return {
      day: name,
      percentage,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Weekly Performance Breakdown</h3>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-5">Average completion rate by day of week</p>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
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
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-lg">
                      <p className="font-bold">{item.day}: {item.percentage}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percentage >= 85 ? '#3B82F6' : entry.percentage >= 75 ? '#10B981' : '#F59E0B'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
