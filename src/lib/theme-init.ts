export type ThemeSetting = "light" | "dark" | "system";

const THEME_KEY = "theme";
const SETTINGS_KEY = "shepherd-settings";

export function readSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readStoredThemeSetting(): ThemeSetting {
  if (typeof window === "undefined") return "system";

  try {
    const direct = localStorage.getItem(THEME_KEY);
    if (direct === "light" || direct === "dark" || direct === "system") {
      return direct;
    }

    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        state?: { themePreference?: ThemeSetting };
      };
      const pref = parsed.state?.themePreference;
      if (pref === "light" || pref === "dark" || pref === "system") {
        return pref;
      }
    }
  } catch {
    /* ignore */
  }

  return "system";
}

export function resolveTheme(setting: ThemeSetting): "light" | "dark" {
  return setting === "system" ? readSystemTheme() : setting;
}

export function applyResolvedTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

/** Apply theme from localStorage as early as possible on the client. */
export function applyThemeFromStorage(): "light" | "dark" {
  const resolved = resolveTheme(readStoredThemeSetting());
  applyResolvedTheme(resolved);
  return resolved;
}
