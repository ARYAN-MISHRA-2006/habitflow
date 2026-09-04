import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  loginWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ error?: string }>;
  signUpWithEmail: (
    name: string,
    email: string,
    pass: string
  ) => Promise<{ error?: string; message?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<void>;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load the authenticated user's profile from Supabase.
   */
  const fetchSupabaseProfile = async (
    userId: string,
    email: string
  ) => {
    if (!supabase) {
      setUser(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setUser(data as Profile);
        return;
      }

      /**
       * Normally the database trigger creates the profile
       * automatically when a user signs up.
       *
       * This is only a safety fallback if the profile
       * does not exist yet.
       */
      if (error?.code === 'PGRST116') {
        const newProfile = {
          id: userId,
          name: email.split('@')[0] || 'User',
          email,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          xp: 0,
          level: 1,
          gamification_enabled: true,
          theme: 'system',
        };

        const {
          data: createdProfile,
          error: createError,
        } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error(
            'Could not create user profile:',
            createError
          );
          setUser(null);
          return;
        }

        setUser(createdProfile as Profile);
        return;
      }

      console.error(
        'Could not fetch user profile:',
        error
      );
      setUser(null);
    } catch (error) {
      console.error(
        'Error fetching Supabase profile:',
        error
      );
      setUser(null);
    }
  };

  /**
   * Initialize authentication when the application starts.
   */
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.error(
        'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
      setUser(null);
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          await fetchSupabaseProfile(
            session.user.id,
            session.user.email || ''
          );
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          'Authentication initialization error:',
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          await fetchSupabaseProfile(
            session.user.id,
            session.user.email || ''
          );
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * REAL EMAIL LOGIN
   */
  const loginWithEmail = async (
    email: string,
    pass: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error:
          'Authentication is unavailable. Please try again later.',
      };
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {};
  };

  /**
   * REAL EMAIL SIGNUP
   */
  const signUpWithEmail = async (
    name: string,
    email: string,
    pass: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error:
          'Authentication is unavailable. Please try again later.',
      };
    }

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
          },
        },
      });

    if (error) {
      return {
        error: error.message,
      };
    }

    if (!data.session) {
      return {
        message:
          'Account created successfully. Please check your email to confirm your account, then sign in.',
      };
    }

    return {};
  };

  /**
   * GOOGLE LOGIN
   */
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error:
          'Authentication is unavailable. Please try again later.',
      };
    }

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {};
  };

  /**
   * REAL LOGOUT
   */
  const logout = async () => {
    if (supabase) {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          'Logout error:',
          error
        );
      }
    }

    setUser(null);
  };

  /**
   * UPDATE REAL USER PROFILE
   */
  const updateProfile = async (
    updates: Partial<Profile>
  ) => {
    if (!user || !supabase) {
      return;
    }

    const { data, error } =
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
      console.error(
        'Profile update error:',
        error
      );
      return;
    }

    if (data) {
      setUser(data as Profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
};