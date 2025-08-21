import type { ScheduleEntry, SessionSchedule } from "$lib/drawing-session.svelte";

export class Scheduler {
    static DEFAULT_ENTRY = { duration: 60, repeat: 1 };
    // Count to keep track of the ID numbers used
    id: number;
    // Index of the selected entry, or -1 if there are no entries
    selectedIdx: number;

    constructor(public schedule: SessionSchedule = []) {
        this.id = 0;
        this.selectedIdx = $state(schedule.length > 0 ? 0 : -1);
    }

    addEntry = (newEntry: ScheduleEntry | undefined = undefined) => {
        if (newEntry === undefined) newEntry = { ...Scheduler.DEFAULT_ENTRY, id: this.id++ };
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
