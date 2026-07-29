"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  applyResolvedTheme,
  readStoredThemeSetting,
  readSystemTheme,
  type ThemeSetting,
} from "@/lib/theme-init";

type ThemeContextValue = {
  theme: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
  resolvedTheme: "light" | "dark";
  systemTheme: "light" | "dark";
};

const STORAGE_KEY = "theme";
const themeListeners = new Set<() => void>();

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type { ThemeSetting };

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => onStoreChange();
  const onStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === "shepherd-settings") {
      onStoreChange();
    }
  };

  media.addEventListener("change", onMediaChange);
  window.addEventListener("storage", onStorageChange);

  return () => {
    themeListeners.delete(onStoreChange);
    media.removeEventListener("change", onMediaChange);
    window.removeEventListener("storage", onStorageChange);
  };
}

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function getThemeSnapshot(): ThemeSetting {
  return readStoredThemeSetting();
}

function getServerThemeSnapshot(): ThemeSetting {
  return "system";
}

function subscribeSystemTheme(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    readSystemTheme,
    () => "light" as const,
  );

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? systemTheme : theme;

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemeSetting) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    notifyThemeListeners();
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme, systemTheme }),
    [theme, setTheme, resolvedTheme, systemTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
