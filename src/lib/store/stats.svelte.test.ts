import * as z from "zod";
import { describe, test as base, expect } from "vitest";
import { Stats, type StatsEntries } from "./stats.svelte";
import { addDays } from "$lib/date-key";
import { createMapStore } from "$lib/store/persistent-store.svelte";

const TODAY = "2026-06-22";
const day = (n: number) => addDays(TODAY, n);

const test = base
    .extend("stats", ({ task: _task }) => new Stats())
    .extend("persistentStore", ({ task: _task }) => createMapStore())
    .extend("customEntries", ({ task: _task }) => ({
        dailyDrawings: { "2026-01-01": 1, "2026-01-02": 2, "2026-01-04": 5 },
        dailyTimeSpent: { "2026-01-01": 1, "2026-01-02": 60, "2026-01-04": 5000 },
    }));

describe("stats.svelte.ts", () => {
    describe("saving and loading", () => {
        test("changes are persisted to store for all entries", async ({
            stats,
            persistentStore,
            customEntries,
        }) => {
            z.parse(Stats.SCHEMA.strict(), customEntries);

            // Modify settings and save to store
            for (const [key, value] of Object.entries(customEntries)) {
                expect(stats[key]).not.toEqual(value);
                stats[key] = value;
            }
            await stats.saveToStore(persistentStore);

            // Load from store
            const loaded = new Stats();
            await loaded.loadFromStore(persistentStore);
            expect(loaded.toPlainObject()).toEqual(expect.objectContaining(customEntries));
        });

        test("falls back to defaults when loading from empty store", async ({
            stats,
            persistentStore,
            customEntries,
        }) => {
            for (const [key, value] of Object.entries(customEntries)) {
                stats[key] = value;
            }
            await stats.loadFromStore(persistentStore);
            expect(stats.toPlainObject()).toEqual(expect.objectContaining(Stats.DEFAULTS));
        });

        test.for([
            { key: "dailyDrawings", invalidEntries: ["not an object", [1, 2, 3]] },
            { key: "dailyTimeSpent", invalidEntries: ["not an object", [1, 2, 3]] },
        ])(
            "invalid $key falls back to default",
            async ({ key, invalidEntries }, { customEntries }) => {
                for (const entry of invalidEntries) {
                    const persistentStore = createMapStore();

                    // Populate persistent store with valid values + one invalid value
                    const stats = new Stats();
                    for (const [key, value] of Object.entries(customEntries)) {
                        stats[key] = value;
                    }
                    await stats.saveToStore(persistentStore);
                    await persistentStore.set(key, entry);

                    // Load from store
                    const loaded = new Stats();
                    await loaded.loadFromStore(persistentStore);
                    expect(loaded.toPlainObject()).toEqual(
                        expect.objectContaining({
                            ...customEntries,
                            [key]: Stats.DEFAULTS[key as keyof StatsEntries],
                        }),
                    );
                }
            },
        );

        test.for([
            {
                key: "dailyDrawings",
                invalidEntries: [{ "not a date": 1 }, { "2026-01-32": 1 }, { "2026-01-31": 0 }],
            },
            {
                key: "dailyTimeSpent",
                invalidEntries: [{ "not a date": 60 }, { "2026-01-32": 60 }, { "2026-01-31": 0 }],
            },
        ])(
            "invalid daily entry in $key is ignored without affecting other entries",
            async ({ key, invalidEntries }, { customEntries }) => {
                for (const entry of invalidEntries) {
                    const persistentStore = createMapStore();

                    // Populate persistent store with valid values + one invalid value
                    const stats = new Stats();
                    for (const [key, value] of Object.entries(customEntries)) {
                        stats[key] = value;
                    }
                    await stats.saveToStore(persistentStore);
                    await persistentStore.set(key, { ...(stats[key] as object), ...entry });

                    // Load from store
                    const loaded = new Stats();
                    await loaded.loadFromStore(persistentStore);
                    expect(loaded.toPlainObject()).toEqual(expect.objectContaining(customEntries));
                }
            },
        );
    });

    describe("totalDrawings", () => {
        test("returns sum of drawings in dailyDrawings", ({ stats }) => {
            stats.dailyDrawings = { "2026-01-01": 1, "2026-01-02": 2, "2026-01-04": 5 };
            expect(stats.totalDrawings).toBe(1 + 2 + 5);
        });

        test("is zero if dailyDrawings empty", ({ stats }) => {
            stats.dailyDrawings = {};
            expect(stats.totalDrawings).toBe(0);
        });
    });

    describe("totalTimeSpent", () => {
        test("returns sum of times spent in dailyTimeSpent", ({ stats }) => {
            stats.dailyTimeSpent = { "2026-01-01": 1, "2026-01-02": 60, "2026-01-04": 5000 };
            expect(stats.totalTimeSpent).toBe(1 + 60 + 5000);
        });

        test("is zero if dailyTimeSpent empty", ({ stats }) => {
            stats.dailyTimeSpent = {};
            expect(stats.totalTimeSpent).toBe(0);
        });
    });

    describe("earliestYear", () => {
        test("finds the first year with activity of either kind", ({ stats }) => {
            stats.dailyDrawings = { "2026-01-01": 1 };
            stats.dailyTimeSpent = { "2024-06-05": 60, "2026-01-01": 60 };
            expect(stats.earliestYear).toBe(2024);
        });

        test("is undefined with no activity at all", ({ stats }) => {
            expect(stats.earliestYear).toBeUndefined();
        });
    });

    describe("totalsForYear", () => {
        test("sums only the days in that calendar year", ({ stats }) => {
            stats.dailyDrawings = { "2025-12-31": 7, "2026-01-01": 1, "2026-12-31": 2 };
            stats.dailyTimeSpent = { "2025-12-31": 90, "2026-01-01": 60, "2026-12-31": 30 };
            expect(stats.totalsForYear(2026)).toEqual({ drawings: 1 + 2, timeSpent: 60 + 30 });
            expect(stats.totalsForYear(2025)).toEqual({ drawings: 7, timeSpent: 90 });
        });

        test("is zero for a year with no activity", ({ stats }) => {
            stats.dailyDrawings = { "2026-01-01": 1 };
            stats.dailyTimeSpent = { "2026-01-01": 60 };
            expect(stats.totalsForYear(2024)).toEqual({ drawings: 0, timeSpent: 0 });
        });
    });

    test("recordSession accumulates activity and persists immediately", async ({
        stats,
        persistentStore,
    }) => {
        await stats.recordSession(3, 120, day(-1), persistentStore); // 2 min, yesterday
        await stats.recordSession(2, 30, day(0), persistentStore); // 0.5 min, today
        await stats.recordSession(5, 150, day(0), persistentStore); // 2.5 min, today (same day)
        await stats.recordSession(0, 0, day(-2), persistentStore); // zero entries should be ignored

        expect(stats.dailyDrawings).toEqual({ [day(-1)]: 3, [day(0)]: 2 + 5 });
        expect(stats.dailyTimeSpent).toEqual({ [day(-1)]: 120, [day(0)]: 30 + 150 });

        const loaded = new Stats();
        await loaded.loadFromStore(persistentStore);
        expect(loaded.dailyDrawings).toEqual(stats.dailyDrawings);
        expect(loaded.dailyTimeSpent).toEqual(stats.dailyTimeSpent);
    });

    describe("streak computation", () => {
        test("no activity yields zero streaks", ({ stats }) => {
            stats.dailyTimeSpent = {};
            expect(stats.computeStreaks(TODAY)).toEqual({ current: 0, longest: 0 });
        });

        test("current streak counts consecutive days ending today", ({ stats }) => {
            stats.dailyTimeSpent = { [day(-2)]: 5, [day(-1)]: 5, [day(0)]: 5 };
            expect(stats.computeStreaks(TODAY)).toEqual({ current: 3, longest: 3 });
        });

        test("streak stays alive on the day after activity (today not yet active)", ({ stats }) => {
            stats.dailyTimeSpent = {
                [day(-2)]: 5,
                [day(-1)]: 5,
                // nothing today yet
            };
            expect(stats.computeStreaks(TODAY).current).toBe(2);
        });

        test("current streak is zero once a full day is missed", ({ stats }) => {
            stats.dailyTimeSpent = {
                [day(-3)]: 5,
                [day(-2)]: 5,
                // gap on day(-1) and day(0)
            };
            expect(stats.computeStreaks(TODAY).current).toBe(0);
        });

        test("longest streak spans the best historical run, current a shorter recent one", ({
            stats,
        }) => {
            stats.dailyTimeSpent = {
                // Older 4-day run
                [day(-10)]: 5,
                [day(-9)]: 5,
                [day(-8)]: 5,
                [day(-7)]: 5,
                // Recent 2-day run ending today
                [day(-1)]: 5,
                [day(0)]: 5,
            };
            expect(stats.computeStreaks(TODAY)).toEqual({ current: 2, longest: 4 });
        });

        test("streak computation handles month boundaries", ({ stats }) => {
            const today = "2026-03-01";
            stats.dailyTimeSpent = {
                "2026-02-27": 5,
                "2026-02-28": 5,
                "2026-03-01": 5,
            };
            expect(stats.computeStreaks(today)).toEqual({ current: 3, longest: 3 });
        });
    });
});
