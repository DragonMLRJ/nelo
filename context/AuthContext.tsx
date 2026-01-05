import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Compatible User type for our app
export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<AppUser>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Supabase session/user to our AppUser
const mapSessionToUser = (session: Session | null): AppUser | null => {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatar: user.user_metadata?.avatar_url,
    isAdmin: false, // You might want to check app_metadata or a 'profiles' table for this
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(mapSessionToUser(session));
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setLoading(false);
      }
    };
    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSessionToUser(session));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      return true;
    } catch (err) {
      setError('An unexpected error occurred during login');
      setLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      return true;
    } catch (err) {
      setError('An unexpected error occurred during registration');
      setLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
    } catch (err) {
      setError('Failed to initiate Google login');
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<AppUser>): Promise<boolean> => {
    if (!user) return false;
    // Note: This updates local metadata. Ideally, you should update a 'profiles' table in Supabase.
    // For now, updating user metadata:
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name,
          avatar_url: userData.avatar
        }
      });

      if (error) {
        setError(error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithGoogle, updateProfile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
