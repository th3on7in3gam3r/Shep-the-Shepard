"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type SupabaseContextValue = {
  configured: boolean;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = createClient();
    if (!supabase) {
      return { error: "Cloud sign-in is not configured." };
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/settings`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ configured, user, loading, signInWithEmail, signOut }),
    [configured, user, loading, signInWithEmail, signOut],
  );

  return (
    <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("useSupabaseAuth must be used within SupabaseProvider");
  }
  return ctx;
}
