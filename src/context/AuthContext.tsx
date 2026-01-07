import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '../supabaseClient';
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
const ADMIN_EMAILS = ['admin@nelo.cg', 'drago@nelo.cg']; // TODO: Move to database role check
const mapSessionToUser = (session: Session | null): AppUser | null => {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatar: user.user_metadata?.avatar_url,
    // Check for 'admin' role in metadata OR legacy hardcoded list for backward compatibility during migration
    isAdmin: user.user_metadata?.role === 'admin' || ADMIN_EMAILS.includes(user.email || ''),
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
      if (session) {
        Cookies.set('sb-access-token', session.access_token, { expires: 1, path: '/' }); // 1 day expire
      } else {
        Cookies.remove('sb-access-token', { path: '/' });
      }
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
        options: {
          // Use the current origin for the callback. 
          // Supabase 'Site URL' must be set to the production URL in the dashboard.
          redirectTo: `${window.location.origin}/`,
        }
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
