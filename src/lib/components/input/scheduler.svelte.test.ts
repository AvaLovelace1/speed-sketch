import { describe, expect, test } from "vitest";
import { Scheduler } from "./scheduler.svelte";

const ENTRIES = [0, 1, 2].map((_) => {
    return { ...Scheduler.DEFAULT_ENTRY, id: self.crypto.randomUUID() };
});

describe("scheduler.svelte.ts", () => {
    test("add entry", () => {
        const scheduler = new Scheduler();

        // Add first entry
        scheduler.addEntry(ENTRIES[0]);
        expect(scheduler.schedule).toEqual([ENTRIES[0]]);
        expect(scheduler.selectedIdx).toBe(0);

        // Add second entry. New entry should be selected.
        scheduler.addEntry(ENTRIES[1]);
        expect(scheduler.schedule).toEqual([ENTRIES[0], ENTRIES[1]]);
        expect(scheduler.selectedIdx).toBe(1);

        // Add third entry after the first.
        scheduler.selectedIdx = 0;
        scheduler.addEntry(ENTRIES[2]);
        expect(scheduler.schedule).toEqual([ENTRIES[0], ENTRIES[2], ENTRIES[1]]);
        expect(scheduler.selectedIdx).toBe(1);
    });

    test("remove entry", () => {
        const scheduler = new Scheduler([...ENTRIES]);

        scheduler.selectedIdx = 1;

        // Remove middle entry
        scheduler.removeEntry();
        expect(scheduler.schedule).toEqual([ENTRIES[0], ENTRIES[2]]);
        expect(scheduler.selectedIdx).toBe(1);

        // Remove last entry
        scheduler.removeEntry();
        expect(scheduler.schedule).toEqual([ENTRIES[0]]);
        expect(scheduler.selectedIdx).toBe(0);

        // Remove first entry, leaving the schedule empty
        scheduler.removeEntry();
        expect(scheduler.schedule).toEqual([]);
        expect(scheduler.selectedIdx).toBe(-1);
    });

    test("move entry up", () => {
        const scheduler = new Scheduler([...ENTRIES]);

        scheduler.selectedIdx = 2;
        scheduler.moveEntryUp();
        expect(scheduler.schedule).toEqual([ENTRIES[0], ENTRIES[2], ENTRIES[1]]);
        expect(scheduler.selectedIdx).toBe(1);

        scheduler.moveEntryUp();
        expect(scheduler.schedule).toEqual([ENTRIES[2], ENTRIES[0], ENTRIES[1]]);
        expect(scheduler.selectedIdx).toBe(0);

        scheduler.moveEntryUp();
        expect(scheduler.schedule).toEqual([ENTRIES[2], ENTRIES[0], ENTRIES[1]]);
        expect(scheduler.selectedIdx).toBe(0);
    });

    test("move entry down", () => {
        const scheduler = new Scheduler([...ENTRIES]);

        scheduler.selectedIdx = 0;
        scheduler.moveEntryDown();
        expect(scheduler.schedule).toEqual([ENTRIES[1], ENTRIES[0], ENTRIES[2]]);
        expect(scheduler.selectedIdx).toBe(1);

        scheduler.moveEntryDown();
        expect(scheduler.schedule).toEqual([ENTRIES[1], ENTRIES[2], ENTRIES[0]]);
        expect(scheduler.selectedIdx).toBe(2);

        scheduler.moveEntryDown();
        expect(scheduler.schedule).toEqual([ENTRIES[1], ENTRIES[2], ENTRIES[0]]);
        expect(scheduler.selectedIdx).toBe(2);
    });

    test("move entry", () => {
        const scheduler = new Scheduler([...ENTRIES]);

        scheduler.selectedIdx = 2;
        scheduler.moveEntry(0);
        expect(scheduler.schedule).toEqual([ENTRIES[2], ENTRIES[0], ENTRIES[1]]);
        expect(scheduler.selectedIdx).toBe(0);

        scheduler.moveEntry(1);
        expect(scheduler.schedule).toEqual([ENTRIES[0], ENTRIES[2], ENTRIES[1]]);
        expect(scheduler.selectedIdx).toBe(1);

        scheduler.moveEntry(2);
        expect(scheduler.schedule).toEqual([ENTRIES[0], ENTRIES[1], ENTRIES[2]]);
        expect(scheduler.selectedIdx).toBe(2);
    });

    test("add break", () => {
        const scheduler = new Scheduler();

        scheduler.addBreak();
        expect(scheduler.schedule[0].isBreak).toBe(true);
        expect(scheduler.schedule[0].duration).toBe(Scheduler.DEFAULT_BREAK.duration);
        expect(scheduler.schedule[0].repeat).toBe(Scheduler.DEFAULT_BREAK.repeat);
    });

    test("totalImgs excludes breaks", () => {
        const scheduler = new Scheduler([
            { duration: 60, repeat: 5 },
            { duration: 30, repeat: 1, isBreak: true },
            { duration: 45, repeat: 3 },
        ]);
        expect(scheduler.totalImgs).toBe(8); // 5 + 0 + 3
    });

    test("totalDuration includes breaks", () => {
        const scheduler = new Scheduler([
            { duration: 60, repeat: 2 },
            { duration: 30, repeat: 1, isBreak: true },
            { duration: 45, repeat: 1 },
        ]);
        expect(scheduler.totalDuration).toBe(60 * 2 + 30 + 45);
    });
});
