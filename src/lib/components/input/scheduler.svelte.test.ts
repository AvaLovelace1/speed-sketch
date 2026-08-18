import { describe, expect, test as base } from "vitest";
import { Scheduler } from "./scheduler.svelte";

const test = base
    .extend("schedule", ({ task: _task }) => [
        { duration: 60, repeat: 2, id: "1" },
        { duration: 10, repeat: 1, id: "2", isBreak: true },
        { duration: 45, repeat: 3, id: "3" },
    ])
    .extend("scheduler", ({ schedule }) => new Scheduler(schedule));

describe("scheduler.svelte.ts", () => {
    test("schedule returns same list given to the scheduler", ({ schedule, scheduler }) => {
        expect(scheduler.schedule).toBe(schedule);
    });

    test("totalImgs sums all repeats (not including breaks)", ({ scheduler }) => {
        expect(scheduler.totalImgs).toBe(5);
    });

    test("totalDuration sums all durations", ({ scheduler }) => {
        expect(scheduler.totalDuration).toBe(60 * 2 + 10 + 45 * 3);
    });

    test("addEntry adds a new entry after the selected idx, in-place", ({
        schedule,
        scheduler,
    }) => {
        const entries = [...schedule];
        const newEntry = { duration: 42, repeat: 42, id: "42" };
        scheduler.selectedIdx = 1;
        scheduler.addEntry(newEntry);
        expect(schedule).toEqual([entries[0], entries[1], newEntry, entries[2]]);
        expect(scheduler.selectedIdx).toBe(2);
    });

    test("addEntry adds a new default non-break entry if unspecified, in-place", ({
        schedule,
        scheduler,
    }) => {
        scheduler.selectedIdx = 0;
        scheduler.addEntry();
        const newEntry = schedule[1];
        expect(newEntry).toEqual(expect.objectContaining(Scheduler.DEFAULT_ENTRY));
        expect(newEntry.id).toBeDefined();
        expect(newEntry.isBreak).toBeUndefined();
        expect(scheduler.selectedIdx).toBe(1);
    });

    test("addBreak adds a new default break entry, in-place", ({ schedule, scheduler }) => {
        scheduler.selectedIdx = 0;
        scheduler.addBreak();
        const newEntry = schedule[1];
        expect(newEntry).toEqual(expect.objectContaining(Scheduler.DEFAULT_BREAK));
        expect(newEntry.id).toBeDefined();
        expect(newEntry.isBreak).toBe(true);
    });
});
