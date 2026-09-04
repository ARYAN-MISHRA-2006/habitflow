import React from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { TodayHabitsList } from '../components/dashboard/TodayHabitsList';
import { DailyProgressChart } from '../components/dashboard/DailyProgressChart';
import { WeeklyProgressRings } from '../components/dashboard/WeeklyProgressRings';
import { MiniCalendarCard } from '../components/dashboard/MiniCalendarCard';
import { MiniInsightsCard } from '../components/dashboard/MiniInsightsCard';
import { useAuth } from '../contexts/AuthContext';
import { formatDateDisplay, getTodayString } from '../utils/dateUtils';

interface DashboardPageProps {
  onOpenAddHabit: () => void;
  setActiveTab: (tab: string) => void;
  onSelectHabit?: (habitId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAddHabit, setActiveTab, onSelectHabit }) => {
  const { user } = useAuth();
  const todayStr = getTodayString();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Good evening, {user?.name || 'Aryan'} 👋
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {formatDateDisplay(todayStr, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span>“Discipline today, a better tomorrow.”</span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <SummaryCards />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Today's Habits & Daily Chart */}
        <div className="lg:col-span-2 space-y-6">
          <TodayHabitsList onOpenAddHabit={onOpenAddHabit} onSelectHabit={onSelectHabit} />
          <DailyProgressChart />
          <WeeklyProgressRings />
        </div>

        {/* Right 1 Column: Calendar Widget & Insights */}
        <div className="space-y-6">
          <MiniCalendarCard onNavigateToCalendar={() => setActiveTab('calendar')} />
          <MiniInsightsCard onNavigateToInsights={() => setActiveTab('insights')} />
        </div>
      </div>
    </div>
  );
};
