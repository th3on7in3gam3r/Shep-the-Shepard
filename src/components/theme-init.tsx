"use client";

import { useLayoutEffect } from "react";
import { applyThemeFromStorage } from "@/lib/theme-init";

/** Runs theme init before paint — replaces blocking layout scripts. */
export function ThemeInit() {
  useLayoutEffect(() => {
    applyThemeFromStorage();
  }, []);

  return null;
}
