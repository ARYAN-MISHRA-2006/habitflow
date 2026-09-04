import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useHabits } from '../contexts/HabitContext';
import { Sun, Moon, Laptop, Download } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { habits, habitLogs } = useHabits();

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            habits,
            habitLogs,
          },
          null,
          2
        )
      );

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `habitflow_export_${new Date().toISOString().split('T')[0]}.json`
    );

    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    let csvContent =
      'data:text/csv;charset=utf-8,Habit ID,Habit Name,Category,Log Date,Completed,Value\n';

    habitLogs.forEach((log) => {
      const habit = habits.find((h) => h.id === log.habit_id);

      csvContent += `"${log.habit_id}","${habit?.name || ''}","${
        habit?.category || ''
      }","${log.log_date}",${log.completed},${log.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');

    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `habitflow_logs_${new Date().toISOString().split('T')[0]}.csv`
    );

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Settings & Preferences
        </h1>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Customize your HabitFlow experience and manage your personal data
        </p>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Appearance
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Backup & Export Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Data Management & Backup
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Download a copy of your habit configurations and history logs.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50"
          >
            <Download size={16} />
            <span>Export JSON Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};