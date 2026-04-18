"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { memberSignUp } from "@/lib/auth/member-sign-up";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { AuthFormData, UserType } from "../types/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (data: AuthFormData, _userType: UserType) => {
    setIsLoading(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setIsLoading(false);
    if (e) {
      setError(e.message);
      return;
    }
  };

  const signUp = async (data: AuthFormData, _userType: UserType) => {
    setIsLoading(true);
    setError(null);
    const fullName = data.full_name?.trim();
    const phone = data.phone?.trim();
    if (!fullName || !phone) {
      setIsLoading(false);
      setError("Name and phone number are required to sign up.");
      return;
    }
    const result = await memberSignUp(data.email, data.password, {
      full_name: fullName,
      phone,
    });
    setIsLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.identitiesEmpty) {
      setError("An account with this email already exists. Please log in.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    session: user ? { user } : null,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
  };
}
