/**
 * Calendar-date helpers that work on plain "YYYY-MM-DD" strings in UTC.
 * Everything in this API is a calendar date (no time of day), so we never
 * touch the server's local timezone.
 */
const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function toEpochDay(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / MS_PER_DAY);
}

export function fromEpochDay(day: number): string {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromEpochDay(toEpochDay(date) + days);
}

export function diffDays(a: string, b: string): number {
  return toEpochDay(a) - toEpochDay(b);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
