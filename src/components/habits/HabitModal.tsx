import React, { useState } from 'react';
import { X, CheckCircle, Droplet, Dumbbell, BookOpen, Code, Heart, Moon, Sun, Sparkles, Target, Shield, Coffee } from 'lucide-react';
import { Habit, FrequencyType, TargetType } from '../../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habitData: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => void;
  initialHabit?: Habit | null;
}

const AVAILABLE_ICONS = [
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'Droplet', icon: Droplet },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Code', icon: Code },
  { name: 'Heart', icon: Heart },
  { name: 'Moon', icon: Moon },
  { name: 'Sun', icon: Sun },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Target', icon: Target },
  { name: 'Shield', icon: Shield },
  { name: 'Coffee', icon: Coffee },
];

const ACCENT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

const CATEGORIES = ['Health', 'Fitness', 'Study', 'Personal Growth', 'Mindfulness', 'Productivity', 'Finance'];

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSubmit, initialHabit }) => {
  const [name, setName] = useState(initialHabit?.name || '');
  const [description, setDescription] = useState(initialHabit?.description || '');
  const [icon, setIcon] = useState(initialHabit?.icon || 'CheckCircle');
  const [category, setCategory] = useState(initialHabit?.category || 'Health');
  const [accentColor, setAccentColor] = useState(initialHabit?.accent_color || '#3B82F6');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(initialHabit?.frequency_type || 'daily');
  const [targetType, setTargetType] = useState<TargetType>(initialHabit?.target_type || 'boolean');
  const [targetValue, setTargetValue] = useState<number>(initialHabit?.target_value || 1);
  const [targetUnit, setTargetUnit] = useState<string>(initialHabit?.target_unit || 'times');
  const [reminderTime, setReminderTime] = useState<string>(initialHabit?.reminder_time || '20:00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name,
      description,
      icon,
      category,
      accent_color: accentColor,
      frequency_type: frequencyType,
      frequency_days: frequencyType === 'weekdays' ? [1, 2, 3, 4, 5] : frequencyType === 'weekends' ? [0, 6] : [0, 1, 2, 3, 4, 5, 6],
      target_type: targetType,
      target_value: Number(targetValue),
      target_unit: targetUnit,
      reminder_time: reminderTime,
      start_date: new Date().toISOString().split('T')[0],
      is_archived: false,
      is_active: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {initialHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Category */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Habit Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Drink 2.5L water, Workout, Read 20 pages"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Select Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map(item => {
                const IconComp = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setIcon(item.name)}
                    className={`p-2.5 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 scale-105'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComp size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Accent Color</label>
            <div className="flex items-center gap-2.5">
              {ACCENT_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    accentColor === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily', label: 'Every day' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'weekends', label: 'Weekends' },
              ].map(freq => (
                <button
                  type="button"
                  key={freq.id}
                  onClick={() => setFrequencyType(freq.id as FrequencyType)}
                  className={`py-2 rounded-xl border font-bold text-center transition-all ${
                    frequencyType === freq.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Type */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Value</label>
              <input
                type="number"
                step="any"
                value={targetValue}
                onChange={e => setTargetValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Unit</label>
              <input
                type="text"
                placeholder="Liters, mins, pages..."
                value={targetUnit}
                onChange={e => setTargetUnit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Reminder Time */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reminder Time</label>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
            >
              {initialHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
