import {
  DAILY_VERSE_CATALOG,
  type DailyVerse,
} from "./daily-verse-catalog";

export type { DailyVerse };

export const DAILY_VERSES: readonly DailyVerse[] = DAILY_VERSE_CATALOG;

const CATALOG_LENGTH = DAILY_VERSE_CATALOG.length;

function resolveDate(input: unknown): Date {
  if (!(input instanceof Date) || Number.isNaN(input.getTime())) {
    return new Date();
  }
  return input;
}

function dayOfYear(date: Date): number {
  const year = date.getFullYear();
  const start = Date.UTC(year, 0, 0);
  const utc = Date.UTC(year, date.getMonth(), date.getDate());
  return Math.floor((utc - start) / 86_400_000);
}

/** Map a validated day-of-year to a bounded catalog index (no string/query construction). */
function catalogIndexForDayOfYear(day: number): number {
  const normalized = ((day % CATALOG_LENGTH) + CATALOG_LENGTH) % CATALOG_LENGTH;
  return Math.min(Math.max(0, normalized), CATALOG_LENGTH - 1);
}

export function getDailyVerse(date?: Date): DailyVerse {
  const resolved = resolveDate(date ?? new Date());
  const index = catalogIndexForDayOfYear(dayOfYear(resolved));
  return DAILY_VERSE_CATALOG[index];
}
