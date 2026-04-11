"use client";

import { useEffect, useState } from "react";

export type AdminViewMode = "list" | "cards";

/** Persisted list/cards choice for admin data tables. */
export function useAdminViewMode(storageKey: string, defaultMode: AdminViewMode = "cards") {
  const [viewMode, setViewMode] = useState<AdminViewMode>(defaultMode);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "cards" || stored === "list") setViewMode(stored);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, viewMode);
    } catch {
      /* ignore */
    }
  }, [storageKey, viewMode]);

  return [viewMode, setViewMode] as const;
}
