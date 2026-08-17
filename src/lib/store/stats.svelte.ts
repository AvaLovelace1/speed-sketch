import * as z from "zod";
import { SvelteDate, SvelteSet } from "svelte/reactivity";
import { getStore, type PersistentStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";

// A single day of drawing activity, for the heatmap calendar.
export interface DailyActivity {
    date: Date;
    value: number;
}

// Return a new date offset from `date` by `n` days.
function addDays(date: Date, n: number): Date {
    const d = new SvelteDate(date);
    d.setDate(d.getDate() + n);
    return d;
}

// Global, all-time drawing statistics, persisted across sessions.
export class Stats implements Record<string, unknown> {
    static get DEFAULTS() {
        return { dailyDrawings: {}, dailyTimeSpent: {} };
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

    // Local date key ("YYYY-MM-DD") for a given date. Uses local time so
    // the heatmap calendar day matches what the user sees on their clock.
    static dateToKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Parse a "YYYY-MM-DD" key back into a Date at local midnight.
    static keyToDate(key: string): Date {
        const [year, month, day] = key.split("-").map(Number);
        return new SvelteDate(year, month - 1, day);
    }

    // Number of drawings and time spent, keyed by date. Values are always positive.
    dailyDrawings: Record<string, number>;
    dailyTimeSpent: Record<string, number>;

    [key: string]: unknown;

    constructor(entries = Stats.DEFAULTS) {
        this.dailyDrawings = $state(entries.dailyDrawings);
        this.dailyTimeSpent = $state(entries.dailyTimeSpent);
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

    // Daily activity as an array suitable for the heatmap calendar. Pulled from dailyTimeSpent.
    get dailyActivity(): DailyActivity[] {
        return Object.entries(this.dailyTimeSpent).map(([key, value]) => ({
            date: Stats.keyToDate(key),
            value,
        }));
    }

    // Record the results of a completed session and persist the updated totals.
    // `date` determines which calendar day the time is credited to.
    async recordSession(
        completedDrawings: number,
        timeSpent: number,
        date: Date = new SvelteDate(),
        persistentStore?: PersistentStore,
    ) {
        const key = Stats.dateToKey(date);
        if (completedDrawings > 0) {
            this.dailyDrawings[key] = (this.dailyDrawings[key] ?? 0) + completedDrawings;
        }
        if (timeSpent > 0) {
            this.dailyTimeSpent[key] = (this.dailyTimeSpent[key] ?? 0) + timeSpent;
        }
        await this.saveToStore(persistentStore);
    }

    // Compute the current and longest daily streaks. The current streak counts back from
    // `today`; if today has no activity yet, it counts back from yesterday.
    computeStreaks(today: Date = new SvelteDate()) {
        const activeDates = new SvelteSet(
            this.dailyActivity.map(({ date }) => Stats.dateToKey(date)),
        );

        // Longest streak
        let longest = 0;
        let run = 0;
        let prevKey: string | null = null;
        for (const key of [...activeDates].sort()) {
            if (prevKey !== null && Stats.dateToKey(addDays(Stats.keyToDate(prevKey), 1)) === key) {
                run += 1;
            } else {
                run = 1;
            }
            if (run > longest) longest = run;
            prevKey = key;
        }

        // Current streak
        let cursor: Date = new SvelteDate(today.getFullYear(), today.getMonth(), today.getDate());
        if (!activeDates.has(Stats.dateToKey(cursor))) cursor = addDays(cursor, -1);
        let current = 0;
        while (activeDates.has(Stats.dateToKey(cursor))) {
            current += 1;
            cursor = addDays(cursor, -1);
        }

        return { current, longest };
    }
}

export type StatsEntries = z.infer<typeof Stats.SCHEMA>;

export const stats = $state(new Stats());
