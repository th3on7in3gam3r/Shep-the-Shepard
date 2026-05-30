"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { useSettingsStore } from "@/stores/settings-store";

/** Applies persisted theme preference on app load. */
export function ThemeSync() {
  const themePreference = useSettingsStore((s) => s.themePreference);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(themePreference);
  }, [themePreference, setTheme]);

  return null;
}
