import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile, UserStatus } from '../types';

const TRIAL_DURATION_DAYS = 3;
const STATUS_CACHE_KEY = 'pagerlo_cached_status';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  status: UserStatus | null;
  daysRemaining: number;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  pollForPaidStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(TRIAL_DURATION_DAYS);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId, 
              status: 'trialing',
              trial_started_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!insertError && newProfile) setProfile(newProfile);
          return;
        }
        console.error('Profile fetch error:', profileError);
        return;
      }

      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      // Don't set loading to true here to avoid UI flickering/skeletons
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && userProfile) {
        setProfile(userProfile);
        localStorage.removeItem(STATUS_CACHE_KEY);
      }
    }
  }, [user]);

  const pollForPaidStatus = useCallback(async () => {
    if (!user) return;
    
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds total
    
    const interval = setInterval(async () => {
      attempts++;
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();
        
      if (!error && (data?.status === 'paid' || data?.status === 'owner')) {
        await refreshProfile();
        clearInterval(interval);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 2000);
  }, [user, refreshProfile]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        
        // CRITICAL: Set loading to false as soon as we know if user exists
        // fetchProfile runs in the background
        setLoading(false);
        
        if (currentUser) {
          fetchProfile(currentUser.id);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        const currentUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(currentUser);
        setLoading(false);
        
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (currentUser) fetchProfile(currentUser.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setStatus(null);
          localStorage.removeItem(STATUS_CACHE_KEY);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }

    let newStatus: UserStatus = 'TRIALING';
    let newDaysRemaining = TRIAL_DURATION_DAYS;

    if (profile) {
        if (profile.status === 'paid') {
            newStatus = 'PAID';
            newDaysRemaining = Infinity;
        } else if (profile.status === 'owner') {
            newStatus = 'OWNER';
            newDaysRemaining = Infinity;
        } else {
            const trialStart = new Date(profile.trial_started_at);
            const now = new Date();
            const trialDurationMs = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
            const elapsedTime = now.getTime() - trialStart.getTime();
            
            if (elapsedTime >= trialDurationMs) {
                newStatus = 'TRIAL_ENDED';
                newDaysRemaining = 0;
            } else {
                newStatus = 'TRIALING';
                const remainingMs = trialDurationMs - elapsedTime;
                newDaysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
            }
        }
    } else {
        // Fallback while profile is still loading in background
        const cached = localStorage.getItem(STATUS_CACHE_KEY) as UserStatus;
        if (cached) newStatus = cached;
    }

    setStatus(newStatus);
    setDaysRemaining(newDaysRemaining);
    if (newStatus) localStorage.setItem(STATUS_CACHE_KEY, newStatus);
  }, [user, profile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setStatus(null);
      localStorage.removeItem(STATUS_CACHE_KEY);
    }
  };

  const value = {
    session,
    user,
    profile,
    status,
    daysRemaining,
    loading,
    signOut,
    refreshProfile,
    pollForPaidStatus
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
