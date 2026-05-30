/** Local calendar date as YYYY-MM-DD. */
export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function yesterdayKey(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}
