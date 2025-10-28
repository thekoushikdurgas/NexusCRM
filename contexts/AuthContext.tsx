

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
      // If fetching profile fails, treat user as logged out to avoid broken state
      await supabase.auth.signOut();
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
    // This function will run once on mount to check the initial auth state.
    const initializeAuth = async () => {
      // 1. Check for an existing session on page load.
      const { data: { session } } = await supabase.auth.getSession();

      // 2. If a session exists, fetch the associated user profile.
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        // 3. If no session, ensure user state is null.
        setUser(null);
      }
      
      // 4. Once the initial check is complete, set loading to false.
      setIsLoading(false);
    };

    initializeAuth();

    // Now, set up the listener for subsequent auth state changes (e.g., login, logout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // This will fire when the user logs in, logs out, or the session is refreshed.
      if (session?.user) {
        // A user logged in or the session was refreshed.
        await fetchUserProfile(session.user);
      } else {
        // The user logged out.
        setUser(null);
      }
    });

    // Cleanup the subscription when the component unmounts.
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
