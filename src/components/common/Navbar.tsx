import React, { useState } from 'react';

import {
  Search,
  Sun,
  Moon,
  Bell,
  Sparkles,
  WifiOff,
  LogOut,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';

import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useHabits } from '../../contexts/HabitContext';

interface NavbarProps {
  onSearchChange?: (term: string) => void;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchChange,
  setActiveTab,
}) => {
  const { isDarkMode, setTheme } = useTheme();

  const { user, logout } = useAuth();

  const { isOffline } = useHabits();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setSearchTerm(value);

    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">

      {/* Search Input Bar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search habits, goals... (Ctrl K)"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
        />

        <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
          Ctrl K
        </kbd>
      </div>

      {/* Brand Icon for mobile screens */}
      <div
        className="flex items-center gap-2 lg:hidden cursor-pointer"
        onClick={() => setActiveTab('dashboard')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
          <Sparkles size={16} />
        </div>

        <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
          HabitFlow
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">

        {/* Offline / Sync indicator */}
        {isOffline ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20 animate-pulse">
            <WifiOff size={14} />
            <span>Offline</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Synced</span>
          </div>
        )}

        {/* Dark / Light Mode */}
        <button
          type="button"
          onClick={() =>
            setTheme(isDarkMode ? 'light' : 'dark')
          }
          className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {isDarkMode ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell size={19} />

            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 px-4 z-50 text-sm">

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Notifications
                </span>

                <button
                  type="button"
                  className="text-xs text-brand-600 dark:text-brand-400 font-semibold"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                >
                  Close
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                No new notifications.
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setShowUserMenu(!showUserMenu)
            }
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >

            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}

            <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {user?.name || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-sm">

              {/* User information */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white text-xs">
                  {user?.name || 'User'}
                </p>

                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || ''}
                </p>
              </div>

              {/* Navigation */}
              <div className="py-1">

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <User size={15} />
                  <span>Profile Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <SettingsIcon size={15} />
                  <span>Preferences</span>
                </button>

              </div>

              {/* Sign Out */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>

              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};