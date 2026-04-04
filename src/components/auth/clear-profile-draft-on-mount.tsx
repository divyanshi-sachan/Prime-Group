"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { clearDraft } from "@/store/slices/profileDraftSlice";

/** Clears onboarding Redux draft once the user has landed on the thank-you page (avoids resetting step mid-navigation). */
export function ClearProfileDraftOnMount() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(clearDraft());
  }, [dispatch]);
  return null;
}
