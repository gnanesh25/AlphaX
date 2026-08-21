import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserSettings } from '../lib/supabase';

export const GOOGLE_CLIENT_ID = '802792167440-6njbasv9osjt1fautfooasoatkiv4q55.apps.googleusercontent.com';

// ─── Types ────────────────────────────────────────────────────

export interface AuthContextValue {
  // Auth state
  user: User | null;
  session: Session | null;
  loading: boolean; // true while session is being restored on first load

  // Profile state
  profile: Profile | null;
  profileLoading: boolean;

  // Settings state
  settings: UserSettings | null;

  // Actions
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithGoogleToken: (idToken: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => Promise<{ error: Error | null }>;
  updateSettings: (updates: Partial<Omit<UserSettings, 'user_id' | 'updated_at'>>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // ─── Fetch profile + settings ──────────────────────────────

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_settings').select('*').eq('user_id', userId).single(),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (settingsRes.data) setSettings(settingsRes.data as UserSettings);
    } catch {
      // Graceful fallback
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // ─── Auth state listener ───────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setSettings(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ─── Sign Up ───────────────────────────────────────────────

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: AuthError | null; needsConfirmation: boolean }> => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/app/dashboard`
      : 'https://alpha-x-beige.vercel.app/app/dashboard';

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
          display_name: fullName.trim().split(' ')[0],
        },
      },
    });

    if (error) return { error, needsConfirmation: false };
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }, []);

  // ─── Sign In ───────────────────────────────────────────────

  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error };
  }, []);

  // ─── Sign In with Google Redirect ─────────────────────────

  const signInWithGoogle = useCallback(async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
        queryParams: {
          client_id: GOOGLE_CLIENT_ID,
        },
      },
    });
    return { error };
  }, []);

  // ─── Sign In with Google ID Token ──────────────────────────

  const signInWithGoogleToken = useCallback(async (idToken: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    return { error };
  }, []);


  // ─── Sign Out ──────────────────────────────────────────────

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSettings(null);
  }, []);

  // ─── Update profile ────────────────────────────────────────

  const updateProfile = useCallback(async (
    updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { error };
    if (data) setProfile(data as Profile);
    return { error: null };
  }, [user]);

  // ─── Update settings ───────────────────────────────────────

  const updateSettings = useCallback(async (
    updates: Partial<Omit<UserSettings, 'user_id' | 'updated_at'>>
  ): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return { error };
    if (data) setSettings(data as UserSettings);
    return { error: null };
  }, [user]);

  // ─── Context value ─────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    session,
    loading,
    profile,
    profileLoading,
    settings,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGoogleToken,
    signOut,
    updateProfile,
    updateSettings,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
