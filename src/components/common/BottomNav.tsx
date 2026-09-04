import React from 'react';
import { LayoutDashboard, CheckSquare, Plus, Calendar as CalendarIcon, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddHabit: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenAddHabit }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around relative">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'dashboard' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'habits' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckSquare size={20} />
          <span>Habits</span>
        </button>

        {/* Center Floating Plus Button */}
        <div className="-mt-6">
          <button
            onClick={onOpenAddHabit}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 active:scale-95 transition-transform"
            aria-label="Add Habit"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'calendar' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarIcon size={20} />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'profile' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};
