import { describe, expect, test } from "vitest";
import { buildCalendar, LEVELS, shadingLevels } from "./heatmap";

describe("heatmap.ts", () => {
    describe("buildCalendar", () => {
        test("places each day in a week column and a weekday row", () => {
            // 2026-06-14 is a Sunday.
            const { days } = buildCalendar("2026-06-14", "2026-06-22");
            expect(days).toHaveLength(9);
            expect(days[0]).toEqual({ key: "2026-06-14", column: 1, row: 1 });
            expect(days[6]).toEqual({ key: "2026-06-20", column: 1, row: 7 });
            expect(days[7]).toEqual({ key: "2026-06-21", column: 2, row: 1 });
            expect(days[8]).toEqual({ key: "2026-06-22", column: 2, row: 2 });
        });

        test("starts a partial first week in the correct row", () => {
            // 2026-06-18 is a Thursday, so it lands in row 5 of the first column.
            const { days, weeks } = buildCalendar("2026-06-18", "2026-06-21");
            expect(days[0]).toEqual({ key: "2026-06-18", column: 1, row: 5 });
            expect(days[3]).toEqual({ key: "2026-06-21", column: 2, row: 1 });
            expect(weeks).toBe(2);
        });

        test("covers a full year in 53 columns", () => {
            const { days, weeks } = buildCalendar("2025-06-19", "2026-06-18");
            expect(days).toHaveLength(365);
            expect(weeks).toBe(53);
        });

        test("handles a single day", () => {
            const { days, weeks, months } = buildCalendar("2026-06-18", "2026-06-18");
            expect(days).toEqual([{ key: "2026-06-18", column: 1, row: 5 }]);
            expect(weeks).toBe(1);
            expect(months).toEqual([]);
        });

        test("returns nothing when the range is inverted", () => {
            expect(buildCalendar("2026-06-18", "2026-06-17")).toEqual({
                days: [],
                weeks: 0,
                months: [],
            });
        });

        test("labels each month at the column where it starts", () => {
            const { months } = buildCalendar("2026-01-01", "2026-03-31", "en-US");
            expect(months).toEqual([
                { key: "2026-01", label: "Jan", column: 1, span: 5 },
                { key: "2026-02", label: "Feb", column: 6, span: 4 },
                { key: "2026-03", label: "Mar", column: 10, span: 5 },
            ]);
        });

        test("omits month labels too narrow to read", () => {
            // July only reaches into a single week column, so it gets no label.
            const { months } = buildCalendar("2026-06-01", "2026-07-05", "en-US");
            expect(months.map(({ label }) => label)).toEqual(["Jun"]);
        });
    });

    describe("shadingLevels", () => {
        test("spreads evenly-spaced values across all levels", () => {
            expect([...shadingLevels([10, 20, 30, 40])]).toEqual([
                [10, 1],
                [20, 2],
                [30, 3],
                [40, 4],
            ]);
        });

        test("ranks by distinct value", () => {
            const levels = shadingLevels([...Array<number>(9).fill(60), 6000]);
            expect(levels.get(60)).toBe(2);
            expect(levels.get(6000)).toBe(LEVELS);
        });

        test("gives every day the top level when they are all equal", () => {
            expect([...shadingLevels([5, 5, 5])]).toEqual([[5, LEVELS]]);
        });

        test("leaves out values with no activity", () => {
            const levels = shadingLevels([0, -5, 7]);
            expect(levels.has(0)).toBe(false);
            expect(levels.has(-5)).toBe(false);
            expect(levels.get(7)).toBe(LEVELS);
        });

        test("is empty when nothing has activity", () => {
            expect(shadingLevels([])).toEqual(new Map());
            expect(shadingLevels([0, 0])).toEqual(new Map());
        });
    });
});
