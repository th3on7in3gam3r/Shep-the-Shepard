"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

export function HighContrastSync() {
  const highContrast = useSettingsStore((s) => s.highContrast);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    return () => document.documentElement.classList.remove("high-contrast");
  }, [highContrast]);

  return null;
}
