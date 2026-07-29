"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

/** Records study/prayer time when leaving a page (minimum 1 min after 60s). */
export function useStudySession() {
  useEffect(() => {
    const start = Date.now();
    return () => {
      const elapsed = Date.now() - start;
      if (elapsed >= 60_000) {
        const minutes = Math.max(1, Math.round(elapsed / 60_000));
        useSettingsStore.getState().addStudyMinutes(minutes);
      }
    };
  }, []);
}
