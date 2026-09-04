import React, { useState } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { Plus, Target } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { goals } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Goals & Milestones</h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Group habits into targeted long-term personal goals
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Target size={30} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Set your first milestone.</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-4">
            Combine multiple habits towards achieving ambitious personal growth targets.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md"
          >
            + Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
