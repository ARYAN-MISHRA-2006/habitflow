import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { Habit } from '../../types';
import { initialHabits } from '../../data/initialData';

interface OnboardingWizardProps {
  onComplete: (selectedHabits?: Habit[]) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['Health', 'Fitness']);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(['h-water', 'h-workout', 'h-read']);

  const focusAreas = [
    { id: 'Health', label: 'Health & Hydration', icon: '💧' },
    { id: 'Fitness', label: 'Fitness & Physical', icon: '🏋️' },
    { id: 'Study', label: 'Study & Learning', icon: '💻' },
    { id: 'Productivity', label: 'Productivity & Focus', icon: '🚀' },
    { id: 'Sleep', label: 'Sleep & Recovery', icon: '🌙' },
    { id: 'Personal growth', label: 'Personal Growth', icon: '📚' },
    { id: 'Mindfulness', label: 'Mindfulness & Meditation', icon: '🧘' },
    { id: 'Finance', label: 'Finance & Saving', icon: '💰' },
  ];

  const toggleFocus = (id: string) => {
    setSelectedFocus(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleHabitSelect = (id: string) => {
    setSelectedHabitIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    const finalHabits = initialHabits.filter(h => selectedHabitIds.includes(h.id));
    onComplete(finalHabits);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top Progress bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
              <Sparkles size={18} />
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">HabitFlow</span>
          </div>
          <button
            onClick={() => onComplete()}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Skip Onboarding
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                s <= step ? 'bg-brand-600' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: What are you trying to improve? */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Welcome to HabitFlow 👋
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Build better routines, one day at a time. What areas are you trying to improve?
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {focusAreas.map(item => {
                const isSelected = selectedFocus.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleFocus(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Select initial habits */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Choose Initial Habits
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Select habits to start tracking in your dashboard:
            </p>

            <div className="space-y-3 mb-8">
              {initialHabits.map(habit => {
                const isSelected = selectedHabitIds.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitSelect(habit.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900 text-brand-600 flex items-center justify-center font-bold">
                        {habit.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{habit.name}</h4>
                        <p className="text-xs text-slate-400">{habit.target_value} {habit.target_unit} • {habit.category}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected ? 'bg-brand-600 text-white' : 'border-2 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete Onboarding */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-5 shadow-xl shadow-brand-500/30">
              <Sparkles size={40} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              You are all set! 🎉
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 mb-8">
              Your personalized HabitFlow dashboard is ready. Start building consistency today!
            </p>

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-xl shadow-brand-500/30"
            >
              Open Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
