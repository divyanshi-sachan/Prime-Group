"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/hooks/useAuth";

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  favoritesCount: number;
  isLoading: boolean;
  /** Profile id while a logged-in toggle request is in flight (for button spinners). */
  favoriteToggleProfileId: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteToggleProfileId, setFavoriteToggleProfileId] = useState<string | null>(null);

  // Load favorites: from Supabase when logged in, else from localStorage
  useEffect(() => {
    if (!user) {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (stored) {
          const arr = JSON.parse(stored) as string[];
          setFavorites(new Set(Array.isArray(arr) ? arr : []));
        } else {
          setFavorites(new Set());
        }
      } catch {
        setFavorites(new Set());
      }
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from("profile_favorites")
        .select("profile_id")
        .eq("user_id", user.id);
      if (!error && data) {
        setFavorites(new Set(data.map((r) => r.profile_id)));
      } else {
        setFavorites(new Set());
      }
      setIsLoading(false);
    })();
  }, [user?.id]);

  // Persist to localStorage when not logged in
  useEffect(() => {
    if (user || typeof window === "undefined") return;
    if (favorites.size > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    }
  }, [user, favorites]);

  const toggleFavorite = useCallback(
    async (profileId: string) => {
      if (user) {
        if (favoriteToggleProfileId === profileId) return;
        setFavoriteToggleProfileId(profileId);
        try {
          const supabase = createClient();
          const isCurrently = favorites.has(profileId);
          if (isCurrently) {
            const { error } = await supabase
              .from("profile_favorites")
              .delete()
              .eq("user_id", user.id)
              .eq("profile_id", profileId);
            if (!error) setFavorites((prev) => {
              const n = new Set(prev);
              n.delete(profileId);
              return n;
            });
          } else {
            const { error } = await supabase
              .from("profile_favorites")
              .insert({ user_id: user.id, profile_id: profileId });
            if (!error) setFavorites((prev) => new Set(prev).add(profileId));
          }
        } finally {
          setFavoriteToggleProfileId(null);
        }
      } else {
        setFavorites((prev) => {
          const next = new Set(prev);
          if (next.has(profileId)) next.delete(profileId);
          else next.add(profileId);
          return next;
        });
      }
    },
    [user, favorites, favoriteToggleProfileId]
  );

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.size,
        isLoading,
        favoriteToggleProfileId,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
