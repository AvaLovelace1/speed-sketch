// Calculations on calendar days as plain "YYYY-MM-DD" strings.

export type DateKey = string;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toTimestamp(date: DateKey): number {
    const [year, month, day] = date.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
}

function toKey(timestamp: number): DateKey {
    return new Date(timestamp).toISOString().slice(0, 10);
}

// Date key for a `Date`, using its *local* calendar day
export function toDateKey(date: Date): DateKey {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getYear(date: DateKey): number {
    return Number(date.slice(0, 4));
}

// Day of the week, 0 (Sunday) through 6 (Saturday)
export function getDayOfWeek(date: DateKey): number {
    return new Date(toTimestamp(date)).getUTCDay();
}

function formatKey(date: DateKey, locale: string | undefined, options: Intl.DateTimeFormatOptions) {
    return new Date(toTimestamp(date)).toLocaleDateString(locale, { ...options, timeZone: "UTC" });
}

// A date key as human-readable text, e.g. "June 18, 2026"
export function formatDateKey(date: DateKey, locale?: string): string {
    return formatKey(date, locale, { year: "numeric", month: "long", day: "numeric" });
}

// Abbreviated month name for a date key, e.g. "Jun"
export function formatMonth(date: DateKey, locale?: string): string {
    return formatKey(date, locale, { month: "short" });
}

export function addDays(date: DateKey, n: number): DateKey {
    return toKey(toTimestamp(date) + n * MS_PER_DAY);
}

// Whole days from `from` to `to`; negative if `to` comes first.
export function daysBetween(from: DateKey, to: DateKey): number {
    return Math.round((toTimestamp(to) - toTimestamp(from)) / MS_PER_DAY);
}
