import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  Habit,
  HabitLog,
  Goal,
  Achievement,
} from '../types';

import {
  initialAchievements,
} from '../data/initialData';

import { getTodayString } from '../utils/dateUtils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

import confetti from 'canvas-confetti';

interface HabitContextType {
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
  achievements: Achievement[];
  isOffline: boolean;
  onboardingCompleted: boolean;

  completeOnboarding: (
    selectedHabits?: Habit[]
  ) => Promise<void>;

  toggleHabitLog: (
    habitId: string,
    dateStr?: string,
    customValue?: number
  ) => Promise<void>;

  createHabit: (
    habitData: Omit<Habit, 'id' | 'user_id' | 'created_at'>
  ) => Promise<void>;

  updateHabit: (
    id: string,
    updates: Partial<Habit>
  ) => Promise<void>;

  deleteHabit: (
    id: string
  ) => Promise<void>;

  archiveHabit: (
    id: string
  ) => Promise<void>;

  createGoal: (
    goalData: Omit<Goal, 'id' | 'user_id' | 'created_at'>
  ) => Promise<void>;

  deleteGoal: (
    id: string
  ) => Promise<void>;

  checkAchievements: () => void;
}

const HabitContext = createContext<
  HabitContextType | undefined
>(undefined);

export const HabitProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, updateProfile } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  /*
   * Achievement definitions are global/static.
   * User-specific achievement progress should be stored
   * separately if/when that functionality is implemented.
   */
  const [achievements] = useState<Achievement[]>(
    initialAchievements
  );

  const [onboardingCompleted, setOnboardingCompleted] =
    useState(false);

  const [isOffline, setIsOffline] =
    useState(!navigator.onLine);

  /*
   * -------------------------------------------------------
   * NETWORK STATUS
   * -------------------------------------------------------
   */

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener(
      'online',
      handleOnline
    );

    window.addEventListener(
      'offline',
      handleOffline
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline
      );

      window.removeEventListener(
        'offline',
        handleOffline
      );
    };
  }, []);

  /*
   * -------------------------------------------------------
   * RESET LOCAL STATE WHEN USER CHANGES
   * -------------------------------------------------------
   *
   * This is important for multi-user support.
   *
   * User A logs out.
   * User B logs in.
   *
   * User B must NEVER see User A's in-memory data.
   */

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setHabitLogs([]);
      setGoals([]);
      setOnboardingCompleted(false);
      return;
    }

    setHabits([]);
    setHabitLogs([]);
    setGoals([]);

    const onboardingKey =
      `habitflow_onboarded_${user.id}`;

    const completed =
      localStorage.getItem(onboardingKey) === 'true';

    setOnboardingCompleted(completed);
  }, [user]);

  /*
   * -------------------------------------------------------
   * LOAD USER DATA FROM SUPABASE
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (
      !user ||
      !isSupabaseConfigured ||
      !supabase
    ) {
      return;
    }

    const client = supabase;
    let cancelled = false;

    const fetchDatabaseData = async () => {
      try {
        /*
         * HABITS
         */
        const {
          data: dbHabits,
          error: habitsError,
        } = await client
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', {
            ascending: false,
          });

        if (habitsError) {
          console.error(
            'Error loading habits:',
            habitsError
          );
        }

        if (!cancelled) {
          setHabits(
            (dbHabits ?? []) as Habit[]
          );
        }

        /*
         * HABIT LOGS
         */
        const {
          data: dbLogs,
          error: logsError,
        } = await client
          .from('habit_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('log_date', {
            ascending: false,
          });

        if (logsError) {
          console.error(
            'Error loading habit logs:',
            logsError
          );
        }

        if (!cancelled) {
          setHabitLogs(
            (dbLogs ?? []) as HabitLog[]
          );
        }

        /*
         * GOALS
         */
        const {
          data: dbGoals,
          error: goalsError,
        } = await client
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', {
            ascending: false,
          });

        if (goalsError) {
          console.error(
            'Error loading goals:',
            goalsError
          );
        }

        if (!cancelled) {
          setGoals(
            (dbGoals ?? []) as Goal[]
          );
        }
      } catch (error) {
        console.error(
          'Error loading user data:',
          error
        );
      }
    };

    fetchDatabaseData();

    /*
     * -----------------------------------------------------
     * REALTIME — HABITS
     * -----------------------------------------------------
     */

    const channel = client
      .channel(
        `habitflow-user-${user.id}`
      )

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setHabits(prev => {
              const exists = prev.some(
                habit =>
                  habit.id === payload.new.id
              );

              if (exists) {
                return prev;
              }

              return [
                payload.new as Habit,
                ...prev,
              ];
            });
          }

          if (payload.eventType === 'UPDATE') {
            setHabits(prev =>
              prev.map(habit =>
                habit.id === payload.new.id
                  ? (payload.new as Habit)
                  : habit
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            setHabits(prev =>
              prev.filter(
                habit =>
                  habit.id !== payload.old.id
              )
            );
          }
        }
      )

      /*
       * -----------------------------------------------------
       * REALTIME — HABIT LOGS
       * -----------------------------------------------------
       */

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_logs',
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            setHabitLogs(prev => {
              const filtered = prev.filter(
                log =>
                  log.id !== payload.new.id
              );

              return [
                ...filtered,
                payload.new as HabitLog,
              ];
            });
          }

          if (
            payload.eventType === 'DELETE'
          ) {
            setHabitLogs(prev =>
              prev.filter(
                log =>
                  log.id !== payload.old.id
              )
            );
          }
        }
      )

      /*
       * -----------------------------------------------------
       * REALTIME — GOALS
       * -----------------------------------------------------
       */

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setGoals(prev => {
              const exists = prev.some(
                goal =>
                  goal.id === payload.new.id
              );

              if (exists) {
                return prev;
              }

              return [
                payload.new as Goal,
                ...prev,
              ];
            });
          }

          if (payload.eventType === 'UPDATE') {
            setGoals(prev =>
              prev.map(goal =>
                goal.id === payload.new.id
                  ? (payload.new as Goal)
                  : goal
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            setGoals(prev =>
              prev.filter(
                goal =>
                  goal.id !== payload.old.id
              )
            );
          }
        }
      )

      .subscribe();

    return () => {
      cancelled = true;
      client.removeChannel(channel);
    };
  }, [user]);

  /*
   * -------------------------------------------------------
   * ONBOARDING
   * -------------------------------------------------------
   */

  const completeOnboarding = async (
    selectedHabits?: Habit[]
  ) => {
    if (!user) {
      console.error(
        'Cannot complete onboarding without a user.'
      );
      return;
    }

    /*
     * Create new habits for THIS authenticated user.
     *
     * Never reuse demo IDs.
     */
    if (
      selectedHabits &&
      selectedHabits.length > 0 &&
      supabase
    ) {
      const habitsToInsert =
        selectedHabits.map(habit => {
          const {
            id,
            user_id,
            created_at,
            ...habitData
          } = habit;

          return {
            ...habitData,
            user_id: user.id,
          };
        });

      const {
        data,
        error,
      } = await supabase
        .from('habits')
        .insert(habitsToInsert)
        .select();

      if (error) {
        console.error(
          'Error creating onboarding habits:',
          error
        );
        return;
      }

      setHabits(
        (data ?? []) as Habit[]
      );
    }

    const onboardingKey =
      `habitflow_onboarded_${user.id}`;

    localStorage.setItem(
      onboardingKey,
      'true'
    );

    setOnboardingCompleted(true);
  };

  /*
   * -------------------------------------------------------
   * TOGGLE HABIT LOG
   * -------------------------------------------------------
   */

  const toggleHabitLog = async (
    habitId: string,
    dateStr: string = getTodayString(),
    customValue?: number
  ) => {
    if (!user || !supabase) {
      return;
    }

    const habit = habits.find(
      h => h.id === habitId
    );

    if (!habit) {
      return;
    }

    const existingIndex =
      habitLogs.findIndex(
        log =>
          log.habit_id === habitId &&
          log.log_date === dateStr
      );

    let newCompletedState = true;

    const newValue =
      customValue !== undefined
        ? customValue
        : habit.target_value;

    let updatedLogs = [...habitLogs];

    if (existingIndex >= 0) {
      const existing =
        habitLogs[existingIndex];

      if (
        habit.target_type === 'boolean'
      ) {
        newCompletedState =
          !existing.completed;
      } else {
        newCompletedState =
          existing.value <
          habit.target_value;
      }

      updatedLogs[existingIndex] = {
        ...existing,
        completed:
          newCompletedState,
        value:
          newCompletedState
            ? newValue
            : 0,
        completed_at:
          newCompletedState
            ? new Date().toISOString()
            : undefined,
      };
    } else {
      const newLog: HabitLog = {
        id:
          `log-${habitId}-${dateStr}-${Date.now()}`,

        habit_id: habitId,

        user_id: user.id,

        log_date: dateStr,

        completed: true,

        value: newValue,

        completed_at:
          new Date().toISOString(),
      };

      updatedLogs.push(newLog);
    }

    setHabitLogs(updatedLogs);

    /*
     * Confetti when all active habits are complete.
     */

    const todayLogs =
      updatedLogs.filter(
        log =>
          log.log_date === dateStr &&
          log.completed
      );

    const activeHabitsToday =
      habits.filter(
        h =>
          h.is_active &&
          !h.is_archived
      );

    if (
      newCompletedState &&
      todayLogs.length ===
        activeHabitsToday.length &&
      activeHabitsToday.length > 0
    ) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: {
          y: 0.7,
        },
      });
    }

    /*
     * Award XP only when completing a habit.
     */

    if (newCompletedState) {
      const xpEarned = 10;

      await updateProfile({
        xp:
          (user.xp || 0) +
          xpEarned,
      });
    }

    /*
     * Save to Supabase.
     */

    const { error } =
      await supabase
        .from('habit_logs')
        .upsert(
          {
            habit_id: habitId,
            user_id: user.id,
            log_date: dateStr,
            completed:
              newCompletedState,
            value:
              newCompletedState
                ? newValue
                : 0,
            completed_at:
              newCompletedState
                ? new Date().toISOString()
                : null,
          },
          {
            onConflict:
              'habit_id,log_date',
          }
        );

    if (error) {
      console.error(
        'Error saving habit log:',
        error
      );
    }
  };

  /*
   * -------------------------------------------------------
   * CREATE HABIT
   * -------------------------------------------------------
   */

  const createHabit = async (
    habitData: Omit<
      Habit,
      'id' | 'user_id' | 'created_at'
    >
  ) => {
    if (!user || !supabase) {
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from('habits')
      .insert({
        ...habitData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(
        'Error creating habit:',
        error
      );
      return;
    }

    if (data) {
      setHabits(prev => [
        data as Habit,
        ...prev,
      ]);
    }
  };

  /*
   * -------------------------------------------------------
   * UPDATE HABIT
   * -------------------------------------------------------
   */

  const updateHabit = async (
    id: string,
    updates: Partial<Habit>
  ) => {
    if (!user || !supabase) {
      return;
    }

    const { data, error } =
      await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
      console.error(
        'Error updating habit:',
        error
      );
      return;
    }

    if (data) {
      setHabits(prev =>
        prev.map(habit =>
          habit.id === id
            ? (data as Habit)
            : habit
        )
      );
    }
  };

  /*
   * -------------------------------------------------------
   * DELETE HABIT
   * -------------------------------------------------------
   */

  const deleteHabit = async (
    id: string
  ) => {
    if (!user || !supabase) {
      return;
    }

    const { error } =
      await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
      console.error(
        'Error deleting habit:',
        error
      );
      return;
    }

    setHabits(prev =>
      prev.filter(
        habit =>
          habit.id !== id
      )
    );

    setHabitLogs(prev =>
      prev.filter(
        log =>
          log.habit_id !== id
      )
    );
  };

  /*
   * -------------------------------------------------------
   * ARCHIVE HABIT
   * -------------------------------------------------------
   */

  const archiveHabit = async (
    id: string
  ) => {
    if (!user || !supabase) {
      return;
    }

    const target =
      habits.find(
        habit =>
          habit.id === id
      );

    if (!target) {
      return;
    }

    const newArchivedState =
      !target.is_archived;

    const { data, error } =
      await supabase
        .from('habits')
        .update({
          is_archived:
            newArchivedState,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
      console.error(
        'Error archiving habit:',
        error
      );
      return;
    }

    if (data) {
      setHabits(prev =>
        prev.map(habit =>
          habit.id === id
            ? (data as Habit)
            : habit
        )
      );
    }
  };

  /*
   * -------------------------------------------------------
   * CREATE GOAL
   * -------------------------------------------------------
   */

  const createGoal = async (
    goalData: Omit<
      Goal,
      'id' | 'user_id' | 'created_at'
    >
  ) => {
    if (!user || !supabase) {
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from('goals')
      .insert({
        ...goalData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(
        'Error creating goal:',
        error
      );
      return;
    }

    if (data) {
      setGoals(prev => [
        data as Goal,
        ...prev,
      ]);
    }
  };

  /*
   * -------------------------------------------------------
   * DELETE GOAL
   * -------------------------------------------------------
   */

  const deleteGoal = async (
    id: string
  ) => {
    if (!user || !supabase) {
      return;
    }

    const { error } =
      await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
      console.error(
        'Error deleting goal:',
        error
      );
      return;
    }

    setGoals(prev =>
      prev.filter(
        goal =>
          goal.id !== id
      )
    );
  };

  /*
   * -------------------------------------------------------
   * ACHIEVEMENTS
   * -------------------------------------------------------
   */

  const checkAchievements =
    useCallback(() => {
      /*
       * Achievement evaluation can be
       * implemented here later.
       */
    }, []);

  /*
   * -------------------------------------------------------
   * PROVIDER
   * -------------------------------------------------------
   */

  return (
    <HabitContext.Provider
      value={{
        habits,
        habitLogs,
        goals,
        achievements,
        isOffline,
        onboardingCompleted,
        completeOnboarding,
        toggleHabitLog,
        createHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        createGoal,
        deleteGoal,
        checkAchievements,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context =
    useContext(HabitContext);

  if (!context) {
    throw new Error(
      'useHabits must be used within HabitProvider'
    );
  }

  return context;
};