export type LiturgicalSeason = "advent" | "lent" | "holy-week" | "ordinary";

export type SeasonInfo = {
  season: LiturgicalSeason;
  label: string;
  emoji: string;
  dayInSeason: number;
  totalDays: number;
};

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const ms = atMidnight(b).getTime() - atMidnight(a).getTime();
  return Math.floor(ms / 86_400_000);
}

/** Anonymous Gregorian algorithm for Easter Sunday. */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getAdventStart(year: number): Date {
  const christmas = new Date(year, 11, 25);
  const d = new Date(christmas);
  let sundays = 0;
  while (sundays < 4) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() === 0) sundays += 1;
  }
  return d;
}

export function getLiturgicalSeason(date = new Date()): LiturgicalSeason {
  const d = atMidnight(date);
  const year = d.getFullYear();

  const easter = getEasterSunday(year);
  const palmSunday = new Date(easter);
  palmSunday.setDate(palmSunday.getDate() - 7);

  const ashWednesday = new Date(easter);
  ashWednesday.setDate(ashWednesday.getDate() - 46);

  if (d >= palmSunday && d <= easter) return "holy-week";

  if (d >= ashWednesday && d < palmSunday) return "lent";

  const adventStart = getAdventStart(year);
  const christmasEve = new Date(year, 11, 24);
  if (d >= adventStart && d <= christmasEve) return "advent";

  return "ordinary";
}

export function getSeasonInfo(date = new Date()): SeasonInfo | null {
  const season = getLiturgicalSeason(date);
  if (season === "ordinary") return null;

  const d = atMidnight(date);
  const year = d.getFullYear();
  const easter = getEasterSunday(year);

  if (season === "advent") {
    const adventStart = getAdventStart(year);
    const christmasEve = new Date(year, 11, 24);
    const dayInSeason = daysBetween(adventStart, d) + 1;
    const totalDays = daysBetween(adventStart, christmasEve) + 1;
    return {
      season,
      label: "Advent",
      emoji: "🕯️",
      dayInSeason,
      totalDays,
    };
  }

  if (season === "lent") {
    const ashWednesday = new Date(easter);
    ashWednesday.setDate(ashWednesday.getDate() - 46);
    const palmSunday = new Date(easter);
    palmSunday.setDate(palmSunday.getDate() - 7);
    const dayInSeason = daysBetween(ashWednesday, d) + 1;
    const totalDays = daysBetween(ashWednesday, palmSunday);
    return {
      season,
      label: "Lent",
      emoji: "🌿",
      dayInSeason,
      totalDays,
    };
  }

  const palmSunday = new Date(easter);
  palmSunday.setDate(palmSunday.getDate() - 7);
  const dayInSeason = daysBetween(palmSunday, d) + 1;
  return {
    season,
    label: "Holy Week",
    emoji: "✝️",
    dayInSeason,
    totalDays: 8,
  };
}

export function getSeasonalGreeting(name: string, date = new Date()): string | null {
  const info = getSeasonInfo(date);
  if (!info) return null;

  const display = name.trim() || "friend";
  if (info.season === "advent") {
    return `Blessed Advent, ${display}`;
  }
  if (info.season === "lent") {
    return `Grace in Lent, ${display}`;
  }
  if (info.dayInSeason === 8) {
    return `Christ is risen, ${display}!`;
  }
  return `Holy Week peace, ${display}`;
}
