import type { DateKey } from "$lib/date-key";
import { addDays, getDayOfWeek, daysBetween, formatMonth } from "$lib/date-key";

export const DAYS_PER_WEEK = 7;
// Month labels narrower than this many week columns are dropped as unreadable
const MIN_MONTH_LABEL_SPAN = 2;
// Number of shading levels above "no activity"
export const LEVELS = 4;

// A day's position in the calendar grid
export interface CalendarDay {
    key: DateKey;
    // 1-based week column
    column: number;
    // 1-based weekday row, 1 (Sunday) through 7 (Saturday)
    row: number;
}

// Month heading spanning the week columns its days fall into
export interface CalendarMonth {
    // "YYYY-MM", unique within the calendar
    key: string;
    // Abbreviated month name, e.g. "Jun"
    label: string;
    column: number;
    span: number;
}

export interface Calendar {
    days: CalendarDay[];
    // Number of week columns the calendar spans
    weeks: number;
    months: CalendarMonth[];
}

// Lay out every day from `start` to `end` (both inclusive) on a weeks-by-weekdays grid
export function buildCalendar(start: DateKey, end: DateKey, locale?: string): Calendar {
    const span = daysBetween(start, end);
    if (span < 0) return { days: [], weeks: 0, months: [] };

    const firstSunday = addDays(start, -getDayOfWeek(start));

    const days: CalendarDay[] = [];
    const months: CalendarMonth[] = [];
    let weeks = 0;
    for (let offset = 0; offset <= span; offset++) {
        const date = addDays(start, offset);
        const column = Math.floor(daysBetween(firstSunday, date) / DAYS_PER_WEEK) + 1;
        days.push({ key: date, column, row: getDayOfWeek(date) + 1 });

        // Each column belongs to the month of its first in-range day
        if (column === weeks) continue;
        weeks = column;
        const month = date.slice(0, 7);
        const previous = months.at(-1);
        if (previous?.key === month) previous.span++;
        else months.push({ key: month, label: formatMonth(date, locale), column, span: 1 });
    }

    return { days, weeks, months: months.filter(({ span }) => span >= MIN_MONTH_LABEL_SPAN) };
}

// Assign each distinct positive value a shading level, from 1 to `LEVELS`,
// by where it ranks among the others. Values not in the map have no activity.
export function shadingLevels(values: number[]): Map<number, number> {
    const ranked = [...new Set(values.filter((value) => value > 0))].sort((a, b) => a - b);
    return new Map(
        ranked.map((value, index) => [
            value,
            Math.min(LEVELS, Math.ceil(((index + 1) / ranked.length) * LEVELS)),
        ]),
    );
}
