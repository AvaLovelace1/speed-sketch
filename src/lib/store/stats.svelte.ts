import * as z from "zod";
import { SvelteDate, SvelteSet } from "svelte/reactivity";
import type { PersistentStore } from "$lib/store/persistent-store.svelte";
import { getStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";
import type { DateKey } from "$lib/date-key";
import { toDateKey, addDays, getYear } from "$lib/date-key";
import StatsDialog from "$lib/components/dialog/StatsDialog.svelte";

// Global, all-time drawing statistics, persisted across sessions.
export class Stats implements Record<string, unknown> {
    static get DEFAULTS() {
        return {
            dailyDrawings: {} as Record<string, number>,
            dailyTimeSpent: {} as Record<string, number>,
        };
    }

    static get SCHEMA() {
        const defaults = Stats.DEFAULTS;
        return z.object({
            dailyDrawings: z
                .record(z.iso.date().catch(""), z.int().gt(0).catch(-1))
                .transform((record) =>
                    Object.fromEntries(
                        Object.entries(record).filter(([key, value]) => key !== "" && value !== -1),
                    ),
                )
                .catch(defaults.dailyDrawings),
            dailyTimeSpent: z
                .record(z.iso.date().catch(""), z.number().gt(0).catch(-1))
                .transform((record) =>
                    Object.fromEntries(
                        Object.entries(record).filter(([key, value]) => key !== "" && value !== -1),
                    ),
                )
                .catch(defaults.dailyTimeSpent),
        });
    }

    // Number of drawings and time spent, keyed by date. Values are always positive.
    dailyDrawings: Record<string, number>;
    dailyTimeSpent: Record<string, number>;

    [key: string]: unknown;

    constructor({ dailyDrawings = {}, dailyTimeSpent = {} } = Stats.DEFAULTS) {
        this.dailyDrawings = $state(dailyDrawings);
        this.dailyTimeSpent = $state(dailyTimeSpent);
    }

    // Removes Svelte reactivity from data key-value pairs
    toPlainObject() {
        const data: Record<string, unknown> = {};
        for (const key of Object.keys(Stats.SCHEMA.shape)) {
            data[key] = $state.snapshot(this[key]);
        }
        return data;
    }

    async loadFromStore(persistentStore?: PersistentStore) {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, Stats.SCHEMA);
        await validatedStore.loadInto(this);
    }

    async saveToStore(persistentStore?: PersistentStore) {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, Stats.SCHEMA);
        await validatedStore.save(this);
    }

    get totalDrawings() {
        return Object.values(this.dailyDrawings).reduce((acc, entry) => acc + entry, 0);
    }

    get totalTimeSpent() {
        return Object.values(this.dailyTimeSpent).reduce((acc, entry) => acc + entry, 0);
    }

    // The earliest calendar year with any recorded activity, or undefined if there is none.
    get earliestYear(): number | undefined {
        const years = [...Object.keys(this.dailyDrawings), ...Object.keys(this.dailyTimeSpent)].map(
            (key) => Number(getYear(key)),
        );
        return years.length > 0 ? Math.min(...years) : undefined;
    }

    // Drawings and time spent within a single calendar year.
    totalsForYear(year: number) {
        const prefix = `${year}-`;
        const inYear = (entries: Record<string, number>) =>
            Object.entries(entries).reduce(
                (total, [key, value]) => (key.startsWith(prefix) ? total + value : total),
                0,
            );
        return { drawings: inYear(this.dailyDrawings), timeSpent: inYear(this.dailyTimeSpent) };
    }

    // Record the results of a completed session and persist the updated totals.
    // `date` determines which calendar day the time is credited to.
    async recordSession(
        completedDrawings: number,
        timeSpent: number,
        date: DateKey = toDateKey(new SvelteDate()),
        persistentStore?: PersistentStore,
    ) {
        if (completedDrawings > 0) {
            this.dailyDrawings[date] = (this.dailyDrawings[date] ?? 0) + completedDrawings;
        }
        if (timeSpent > 0) {
            this.dailyTimeSpent[date] = (this.dailyTimeSpent[date] ?? 0) + timeSpent;
        }
        await this.saveToStore(persistentStore);
    }

    // Compute the current and longest daily streaks. The current streak counts back from
    // `today`; if today has no activity yet, it counts back from yesterday.
    computeStreaks(today: DateKey = toDateKey(new SvelteDate())) {
        const activeDates = new SvelteSet(
            Object.entries(this.dailyTimeSpent).map(([date, _]) => date),
        );

        // Longest streak
        let longest = 0;
        let run = 0;
        let prevKey: string | null = null;
        for (const key of [...activeDates].sort()) {
            if (prevKey !== null && addDays(prevKey, 1) === key) run += 1;
            else run = 1;
            if (run > longest) longest = run;
            prevKey = key;
        }

        // Current streak
        let cursor: DateKey = today;
        if (!activeDates.has(cursor)) cursor = addDays(cursor, -1);
        let current = 0;
        while (activeDates.has(cursor)) {
            current += 1;
            cursor = addDays(cursor, -1);
        }

        return { current, longest };
    }
}

export type StatsEntries = z.infer<typeof Stats.SCHEMA>;

export const stats = $state(new Stats());

export const statsDialog = $state({
    component: null as StatsDialog | null,
});
