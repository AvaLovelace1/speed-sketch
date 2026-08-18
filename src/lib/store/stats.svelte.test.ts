import * as z from "zod";
import { describe, test as base, expect } from "vitest";
import { Stats, type StatsEntries } from "./stats.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";
import { SvelteDate } from "svelte/reactivity";

const TODAY = new Date(2026, 6, 22);
const day = (n: number) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + n);
    return d;
};

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

    test("date/key conversion round-trips", () => {
        const key = "2025-12-31";
        const date = new SvelteDate(2025, 11, 31);
        expect(Stats.keyToDate(key)).toEqual(date);
        expect(Stats.dateToKey(date)).toBe(key);
    });

    describe("getters", () => {
        test("totalDrawings returns sum of drawings in dailyDrawings", ({ stats }) => {
            stats.dailyDrawings = { "2026-01-01": 1, "2026-01-02": 2, "2026-01-04": 5 };
            expect(stats.totalDrawings).toBe(1 + 2 + 5);
        });

        test("totalDrawings is zero if dailyDrawings empty", ({ stats }) => {
            stats.dailyDrawings = {};
            expect(stats.totalDrawings).toBe(0);
        });

        test("totalTimeSpent returns sum of times spent in dailyTimeSpent", ({ stats }) => {
            stats.dailyTimeSpent = { "2026-01-01": 1, "2026-01-02": 60, "2026-01-04": 5000 };
            expect(stats.totalTimeSpent).toBe(1 + 60 + 5000);
        });

        test("totalTimeSpent is zero if dailyTimeSpent empty", ({ stats }) => {
            stats.dailyTimeSpent = {};
            expect(stats.totalTimeSpent).toBe(0);
        });

        test("dailyActivity returns activity from dailyTimeSpent", ({ stats }) => {
            stats.dailyTimeSpent = { "2026-01-01": 1, "2026-01-02": 60 };
            expect(stats.dailyActivity).toEqual([
                { date: Stats.keyToDate("2026-01-01"), value: 1 },
                { date: Stats.keyToDate("2026-01-02"), value: 60 },
            ]);
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

        expect(stats.dailyDrawings).toEqual({
            [Stats.dateToKey(day(-1))]: 3,
            [Stats.dateToKey(day(0))]: 2 + 5,
        });
        expect(stats.dailyTimeSpent).toEqual({
            [Stats.dateToKey(day(-1))]: 120,
            [Stats.dateToKey(day(0))]: 30 + 150,
        });

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
            stats.dailyTimeSpent = {
                [Stats.dateToKey(day(-2))]: 5,
                [Stats.dateToKey(day(-1))]: 5,
                [Stats.dateToKey(day(0))]: 5,
            };
            expect(stats.computeStreaks(TODAY)).toEqual({ current: 3, longest: 3 });
        });

        test("streak stays alive on the day after activity (today not yet active)", ({ stats }) => {
            stats.dailyTimeSpent = {
                [Stats.dateToKey(day(-2))]: 5,
                [Stats.dateToKey(day(-1))]: 5,
                // nothing today yet
            };
            expect(stats.computeStreaks(TODAY).current).toBe(2);
        });

        test("current streak is zero once a full day is missed", ({ stats }) => {
            stats.dailyTimeSpent = {
                [Stats.dateToKey(day(-3))]: 5,
                [Stats.dateToKey(day(-2))]: 5,
                // gap on day(-1) and day(0)
            };
            expect(stats.computeStreaks(TODAY).current).toBe(0);
        });

        test("longest streak spans the best historical run, current a shorter recent one", ({
            stats,
        }) => {
            stats.dailyTimeSpent = {
                // Older 4-day run
                [Stats.dateToKey(day(-10))]: 5,
                [Stats.dateToKey(day(-9))]: 5,
                [Stats.dateToKey(day(-8))]: 5,
                [Stats.dateToKey(day(-7))]: 5,
                // Recent 2-day run ending today
                [Stats.dateToKey(day(-1))]: 5,
                [Stats.dateToKey(day(0))]: 5,
            };
            expect(stats.computeStreaks(TODAY)).toEqual({ current: 2, longest: 4 });
        });

        test("streak computation handles month boundaries", ({ stats }) => {
            const today = new Date(2026, 2, 1); // 2026-03-01
            stats.dailyTimeSpent = {
                "2026-02-27": 5,
                "2026-02-28": 5,
                "2026-03-01": 5,
            };
            expect(stats.computeStreaks(today)).toEqual({ current: 3, longest: 3 });
        });
    });
});
