import type { ScheduleEntry, SessionSchedule } from "$lib/drawing-session.svelte";

export class Scheduler {
    static DEFAULT_ENTRY = { duration: 60, repeat: 1 };
    // Index of the selected entry, or -1 if there is no selection
    #selectedIdx: number;

    constructor(public readonly schedule: SessionSchedule = []) {
        this.#selectedIdx = $state(schedule.length > 0 ? 0 : -1);
    }

    get selectedIdx() {
        return this.#selectedIdx;
    }

    set selectedIdx(value: number) {
        if (value < -1 || value >= this.schedule.length) {
            throw new Error(`selectedIdx out of range: ${value}`);
        }
        this.#selectedIdx = value;
    }

    get totalImgs() {
        return this.schedule.reduce((acc, entry) => acc + entry.repeat, 0);
    }

    get totalDuration() {
        return this.schedule.reduce((acc, entry) => acc + entry.duration * entry.repeat, 0);
    }

    addEntry = (newEntry: ScheduleEntry | undefined = undefined) => {
        if (newEntry === undefined) {
            newEntry = { ...Scheduler.DEFAULT_ENTRY, id: self.crypto.randomUUID() };
        }
        this.schedule.splice(this.selectedIdx + 1, 0, newEntry);
        this.selectedIdx++;
    };

    removeEntry = () => {
        this.schedule.splice(this.selectedIdx, 1);
        this.selectedIdx = Math.min(this.selectedIdx, this.schedule.length - 1);
    };

    moveEntryUp = () => {
        if (this.selectedIdx === 0) return;
        const entry = this.schedule[this.selectedIdx];
        this.schedule[this.selectedIdx] = this.schedule[this.selectedIdx - 1];
        this.schedule[this.selectedIdx - 1] = entry;
        this.selectedIdx--;
    };

    moveEntryDown = () => {
        if (this.selectedIdx === this.schedule.length - 1) return;
        const entry = this.schedule[this.selectedIdx];
        this.schedule[this.selectedIdx] = this.schedule[this.selectedIdx + 1];
        this.schedule[this.selectedIdx + 1] = entry;
        this.selectedIdx++;
    };

    moveEntry = (newIdx: number) => {
        if (newIdx < 0 || newIdx >= this.schedule.length) {
            throw new Error(`newIdx out of range: ${newIdx}`);
        }
        const entry = this.schedule[this.selectedIdx];
        this.removeEntry();
        this.selectedIdx = newIdx - 1;
        this.addEntry(entry);
    };
}
