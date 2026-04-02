"use client";

import { useState, useEffect, useCallback } from "react";
import { getTrip } from "./storage";
import type { Trip } from "./types";

/**
 * Hook that reads a trip from localStorage and keeps it fresh
 * across Next.js App Router navigations and tab focus changes.
 */
export function useTrip(code: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(() => {
    const t = getTrip(code);
    if (!t) {
      setNotFound(true);
      setTrip(null);
    } else {
      setNotFound(false);
      setTrip(t);
    }
  }, [code]);

  // Read on mount (always runs, even if code is the same)
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-read when tab regains focus or becomes visible
  useEffect(() => {
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return { trip, setTrip, notFound, refresh };
}
