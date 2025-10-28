

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{success: boolean, message: string}>;
  register: (name: string, email: string, pass: string) => Promise<{success: boolean, message: string}>;
  logout: () => void;
  isLoading: boolean;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (sessionUser: any) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error.message);
      setUser(null);
    } else if (profile) {
      const appUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role || 'Member',
        avatarUrl: profile.avatar_url,
        isActive: profile.is_active,
        lastLogin: sessionUser.last_sign_in_at ? new Date(sessionUser.last_sign_in_at).toLocaleString() : 'N/A',
      };
      setUser(appUser);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    // Check active session on initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
  };

  const login = async (email: string, pass: string): Promise<{success: boolean, message: string}> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: '' };
  };

  const register = async (name: string, email: string, pass: string): Promise<{success: boolean, message: string}> => {
    const { data, error } = await supabase.auth.signUp({ email, password: pass });

    if (error) {
        return { success: false, message: error.message };
    }
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            name,
            avatar_url: `https://picsum.photos/seed/${data.user.id}/40/40`,
        });

        if (profileError) {
            return { success: false, message: `Could not create user profile: ${profileError.message}` };
        }
    }

    return { success: true, message: 'Registration successful! Please check your email to verify.' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};