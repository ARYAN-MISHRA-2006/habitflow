import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HabitProvider, useHabits } from './contexts/HabitContext';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { Navbar } from './components/common/Navbar';
import { HabitModal } from './components/habits/HabitModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

import { DashboardPage } from './pages/DashboardPage';
import { HabitsPage } from './pages/HabitsPage';
import { HabitDetailPage } from './pages/HabitDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { InsightsPage } from './pages/InsightsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { Habit } from './types';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const { habits, onboardingCompleted, completeOnboarding, createHabit, updateHabit } = useHabits();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs font-bold gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
        <span>Loading your routines...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleOpenAddHabit = () => {
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  };

  const handleSelectHabit = (habitId: string) => {
    setSelectedHabitId(habitId);
    setActiveTab('habit-detail');
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
    } else {
      await createHabit(habitData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Show Onboarding Wizard if first time user */}
      {!onboardingCompleted && (
        <OnboardingWizard onComplete={completeOnboarding} />
      )}

      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar setActiveTab={setActiveTab} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onOpenAddHabit={handleOpenAddHabit}
              setActiveTab={setActiveTab}
              onSelectHabit={handleSelectHabit}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsPage
              onOpenAddHabit={handleOpenAddHabit}
              onEditHabit={handleEditHabit}
              onSelectHabit={handleSelectHabit}
            />
          )}

          {activeTab === 'habit-detail' && selectedHabitId && (
            <HabitDetailPage
              habitId={selectedHabitId}
              onBack={() => setActiveTab('habits')}
              onEditHabit={handleEditHabit}
            />
          )}

          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'goals' && <GoalsPage />}
          {activeTab === 'achievements' && <AchievementsPage />}
          {activeTab === 'insights' && <InsightsPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddHabit={handleOpenAddHabit}
      />

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSubmit={handleSaveHabit}
        initialHabit={editingHabit}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HabitProvider>
          <MainApp />
        </HabitProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
