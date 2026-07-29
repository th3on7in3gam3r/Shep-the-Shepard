import type { DevotionTheme } from "@/lib/devotions";

/** Soft chip surfaces for devotion themes. */
export function getDevotionThemeChipClasses(
  theme: DevotionTheme,
  selected: boolean,
): string {
  const map: Record<DevotionTheme, { idle: string; selected: string }> = {
    Peace: {
      idle: "border-sky-200/80 bg-sky-50/90 text-sky-950 hover:border-sky-300 dark:border-sky-800/50 dark:bg-sky-950/35 dark:text-sky-50",
      selected:
        "scale-[1.03] border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-500/20 dark:border-sky-400 dark:bg-sky-500",
    },
    Trust: {
      idle: "border-teal-200/80 bg-teal-50/90 text-teal-950 hover:border-teal-300 dark:border-teal-800/50 dark:bg-teal-950/35 dark:text-teal-50",
      selected:
        "scale-[1.03] border-teal-600 bg-teal-600 text-white shadow-sm dark:border-teal-400 dark:bg-teal-600",
    },
    Gratitude: {
      idle: "border-amber-200/80 bg-amber-50/90 text-amber-950 hover:border-amber-300 dark:border-amber-800/45 dark:bg-amber-950/30 dark:text-amber-50",
      selected:
        "scale-[1.03] border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/25 dark:border-amber-400 dark:bg-amber-500",
    },
    Courage: {
      idle: "border-orange-200/80 bg-orange-50/90 text-orange-950 hover:border-orange-300 dark:border-orange-800/45 dark:bg-orange-950/30 dark:text-orange-50",
      selected:
        "scale-[1.03] border-orange-500 bg-orange-500 text-white shadow-sm dark:border-orange-400 dark:bg-orange-500",
    },
    Love: {
      idle: "border-rose-200/80 bg-rose-50/90 text-rose-950 hover:border-rose-300 dark:border-rose-800/45 dark:bg-rose-950/30 dark:text-rose-50",
      selected:
        "scale-[1.03] border-rose-500 bg-rose-500 text-white shadow-sm dark:border-rose-400 dark:bg-rose-500",
    },
    Hope: {
      idle: "border-yellow-200/80 bg-yellow-50/90 text-yellow-950 hover:border-yellow-300 dark:border-yellow-800/40 dark:bg-yellow-950/25 dark:text-yellow-50",
      selected:
        "scale-[1.03] border-yellow-500 bg-yellow-400 text-yellow-950 shadow-sm shadow-yellow-400/25 dark:border-yellow-400 dark:bg-yellow-500",
    },
    Rest: {
      idle: "border-emerald-200/80 bg-emerald-50/90 text-emerald-950 hover:border-emerald-300 dark:border-emerald-800/45 dark:bg-emerald-950/30 dark:text-emerald-50",
      selected:
        "scale-[1.03] border-emerald-600 bg-emerald-600 text-white shadow-sm dark:border-emerald-400 dark:bg-emerald-600",
    },
    Wisdom: {
      idle: "border-stone-200/90 bg-stone-50/90 text-stone-900 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-50",
      selected:
        "scale-[1.03] border-stone-600 bg-stone-700 text-white shadow-sm dark:border-stone-400 dark:bg-stone-600",
    },
  };
  const pair = map[theme];
  return selected ? pair.selected : pair.idle;
}
