import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{success: boolean, message: string}>;
  register: (name: string, email: string, pass: string) => Promise<{success: boolean, message: string}>;
  logout: () => void;
  isLoading: boolean;
  isLoggingOut: boolean;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // isLoading is true only during the initial session check on app load.
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchUserProfile = async (sessionUser: any) => {
    console.log(`[AUTH] Fetching profile for user ID: ${sessionUser.id}`);
    try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();
        
        // This handles network errors or other unexpected Supabase errors.
        if (error && error.code !== 'PGRST116') { // 'PGRST116' means no rows found, which is handled below.
          throw new Error(error.message);
        }

        if (profile) {
          console.log('[AUTH] Profile found. Mapping to application user model:', profile);
          
          const appUser: User = {
            id: profile.id,
            name: profile.name || 'Unnamed User', // Default for name
            email: profile.email,
            role: profile.role || 'Member',
            avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/40/40`, // Default for avatar
            isActive: profile.is_active ?? false, // Default for activity status
            lastLogin: sessionUser.last_sign_in_at ? new Date(sessionUser.last_sign_in_at).toLocaleString() : 'N/A',
            jobTitle: profile.job_title,
            bio: profile.bio,
            timezone: profile.timezone,
            notifications: profile.notifications || { weeklyReports: true, newLeadAlerts: true },
          };

          if (!profile.name) console.warn(`[AUTH] User profile for ${profile.id} has no name.`);
          if (!profile.avatar_url) console.warn(`[AUTH] User profile for ${profile.id} has no avatar. Using default.`);

          setUser(appUser);
          console.log('[AUTH] User state set with complete profile data.');
        } else {
            // This case is hit when the query succeeds but no profile is found for the user.
            console.error(`[AUTH] No profile found for user ID: ${sessionUser.id}. This is a critical error, as a profile should be created by a database trigger upon user signup. Signing out to prevent an inconsistent state.`);
            await supabase.auth.signOut();
            setUser(null);
        }
    } catch (e: any) {
        console.error("[AUTH] A critical error occurred during profile fetch:", e.message);
        console.log('[AUTH] Signing out due to profile fetch error.');
        await supabase.auth.signOut();
        setUser(null);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    console.log('[AUTH] AuthProvider mounted. Checking for initial session.');

    // Check the current session once on load.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log(`[AUTH] Initial session fetch complete. Session exists: ${!!session}`);
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      // Once the initial check is done, we are no longer in the initial loading state.
      setIsLoading(false);
      console.log('[AUTH] Initial loading state finished.');
    });

    // Now, set up a listener for subsequent auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // This will fire for events like SIGNED_IN, SIGNED_OUT after the initial load.
        console.log(`[AUTH] Auth state changed. Event: ${event}`);
        if (event === 'SIGNED_IN' && session?.user) {
          // If the user state isn't already set, or it's a different user, fetch profile.
           await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      console.log('[AUTH] AuthProvider unmounting. Unsubscribing from auth state changes.');
      subscription.unsubscribe();
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.


  const refreshUserProfile = async () => {
      console.log('[AUTH] Refreshing user profile...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
        console.log('[AUTH] Profile refresh complete.');
      } else {
        console.log('[AUTH] No session found during refresh.');
      }
  };

  const login = async (email: string, pass: string): Promise<{success: boolean, message: string}> => {
    console.log(`[AUTH] Attempting to log in user: ${email}`);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      console.error(`[AUTH] Login failed for ${email}:`, error.message);
      return { success: false, message: error.message };
    }
    console.log(`[AUTH] Login successful for ${email}. Auth state will change and trigger profile fetch.`);
    return { success: true, message: '' };
  };

  const register = async (name: string, email: string, pass: string): Promise<{success: boolean, message: string}> => {
    console.log(`[AUTH] Attempting to register new user: ${email}`);
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
            data: {
                name: name,
                avatar_url: `https://picsum.photos/seed/${Date.now()}/40/40`,
            }
        }
    });

    if (error) {
        console.error(`[AUTH] Registration failed for ${email}:`, error.message);
        return { success: false, message: error.message };
    }
    
    // A database trigger should create the user profile. The client just needs to wait for the sign-in event.
    console.log('[AUTH] Supabase user created. Awaiting email verification.');
    return { success: true, message: 'Registration successful! Please check your email to verify your account.' };
  };

  const logout = () => {
    console.log('[AUTH] User initiated logout.');
    setIsLoggingOut(true);

    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        console.error('[AUTH] Error during sign out:', error.message);
      }
      // Delay turning off the loading screen to make the transition smooth.
      // The onAuthStateChange listener handles setting the user state to null.
      setTimeout(() => {
        console.log('[AUTH] Logout transition complete.');
        setIsLoggingOut(false);
      }, 1500);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, isLoggingOut, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
