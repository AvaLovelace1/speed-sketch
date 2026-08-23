import { describe, expect, test } from "vitest";
import {
    addDays,
    getYear,
    getDayOfWeek,
    daysBetween,
    formatDateKey,
    formatMonth,
    toDateKey,
} from "./date-key";

describe("date-key.ts", () => {
    describe("toDateKey", () => {
        test("formats a local date as YYYY-MM-DD", () => {
            expect(toDateKey(new Date(2026, 5, 18))).toBe("2026-06-18");
            expect(toDateKey(new Date(2026, 0, 1))).toBe("2026-01-01");
        });

        test("uses the local calendar day, not UTC", () => {
            expect(toDateKey(new Date(2026, 5, 18, 23, 30))).toBe("2026-06-18");
            expect(toDateKey(new Date(2026, 5, 18, 0, 30))).toBe("2026-06-18");
        });
    });

    test("getYear returns the year from a date key", () => {
        expect(getYear("2026-06-18")).toBe(2026);
        expect(getYear("2025-01-01")).toBe(2025);
    });

    test("getDayOfWeek returns 0 for Sunday through 6 for Saturday", () => {
        expect(getDayOfWeek("2026-06-14")).toBe(0); // Sunday
        expect(getDayOfWeek("2026-06-18")).toBe(4); // Thursday
        expect(getDayOfWeek("2026-06-20")).toBe(6); // Saturday
    });

    test("formatDateKey renders a human-readable date", () => {
        expect(formatDateKey("2026-06-18", "en-US")).toBe("June 18, 2026");
        expect(formatDateKey("2026-01-01", "en-US")).toBe("January 1, 2026");
    });

    test("formatMonth renders an abbreviated month name", () => {
        expect(formatMonth("2026-06-01", "en-US")).toBe("Jun");
        expect(formatMonth("2026-01-31", "en-US")).toBe("Jan");
    });

    describe("addDays", () => {
        test("moves forwards and backwards across month boundaries", () => {
            expect(addDays("2026-06-18", 1)).toBe("2026-06-19");
            expect(addDays("2026-06-18", -1)).toBe("2026-06-17");
            expect(addDays("2026-06-30", 1)).toBe("2026-07-01");
            expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
            expect(addDays("2026-06-18", 0)).toBe("2026-06-18");
        });

        test("crosses a DST boundary without drifting", () => {
            expect(addDays("2026-03-07", 1)).toBe("2026-03-08");
            expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
            expect(addDays("2026-10-31", 2)).toBe("2026-11-02");
        });

        test("handles leap days", () => {
            expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
            expect(addDays("2028-02-29", 1)).toBe("2028-03-01");
            expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
        });
    });

    test("daysBetween counts whole days from the first key to the second", () => {
        expect(daysBetween("2026-06-18", "2026-06-18")).toBe(0);
        expect(daysBetween("2026-06-18", "2026-06-25")).toBe(7);
        expect(daysBetween("2026-06-25", "2026-06-18")).toBe(-7);
        expect(daysBetween("2025-06-18", "2026-06-18")).toBe(365);
    });
});
