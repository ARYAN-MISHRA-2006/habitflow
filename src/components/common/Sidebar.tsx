import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Target, 
  Trophy, 
  Lightbulb, 
  Settings, 
  User, 
  Sparkles 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 px-4 py-6 select-none z-30 justify-between transition-colors">
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-3 mb-8 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-500 to-teal-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-black text-xl">
            <Sparkles size={22} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              HabitFlow
            </h1>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Build consistency.
            </p>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <div className="space-y-1">
          {bottomItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className="text-slate-400 dark:text-slate-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Motivational Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border border-brand-100/80 dark:border-slate-700/50">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
            Small actions.
          </p>
          <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
            Big consistency.
          </p>
        </div>
      </div>
    </aside>
  );
};
