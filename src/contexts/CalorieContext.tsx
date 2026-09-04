import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CalorieEntry {
  id: string;
  user_id: string;
  food_name: string;
  fdc_id: number | null;
  quantity: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: string | null;
  consumed_at: string;
  created_at: string;
}

interface AddCalorieEntry {
  food_name: string;
  fdc_id?: number | null;
  quantity: number;
  serving_unit: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  meal_type?: string | null;
  consumed_at?: string;
}

interface CalorieContextType {
  entries: CalorieEntry[];
  loading: boolean;
  addEntry: (entry: AddCalorieEntry) => Promise<{ error?: string }>;
  deleteEntry: (id: string) => Promise<{ error?: string }>;
  refreshEntries: () => Promise<void>;
}

const CalorieContext = createContext<CalorieContextType | undefined>(
  undefined
);

export function CalorieProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [entries, setEntries] = useState<CalorieEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshEntries = async () => {
    if (!user || !supabase) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('calorie_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('consumed_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch calorie entries:', error);
      setEntries([]);
    } else {
      setEntries(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    refreshEntries();
  }, [user?.id]);

  const addEntry = async (entry: AddCalorieEntry) => {
    if (!user || !supabase) {
      return { error: 'You must be logged in.' };
    }

    const { data, error } = await supabase
      .from('calorie_entries')
      .insert({
        user_id: user.id,
        food_name: entry.food_name,
        fdc_id: entry.fdc_id ?? null,
        quantity: entry.quantity,
        serving_unit: entry.serving_unit,
        calories: entry.calories,
        protein_g: entry.protein_g ?? 0,
        carbs_g: entry.carbs_g ?? 0,
        fat_g: entry.fat_g ?? 0,
        meal_type: entry.meal_type ?? null,
        consumed_at: entry.consumed_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add calorie entry:', error);
      return { error: error.message };
    }

    setEntries((prev) => [data, ...prev]);

    return {};
  };

  const deleteEntry = async (id: string) => {
    if (!user || !supabase) {
      return { error: 'You must be logged in.' };
    }

    const { error } = await supabase
      .from('calorie_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete calorie entry:', error);
      return { error: error.message };
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));

    return {};
  };

  return (
    <CalorieContext.Provider
      value={{
        entries,
        loading,
        addEntry,
        deleteEntry,
        refreshEntries,
      }}
    >
      {children}
    </CalorieContext.Provider>
  );
}

export function useCalories() {
  const context = useContext(CalorieContext);

  if (!context) {
    throw new Error(
      'useCalories must be used inside a CalorieProvider'
    );
  }

  return context;
}