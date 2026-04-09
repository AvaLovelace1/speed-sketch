import type { ScheduleEntry, SessionSchedule } from "$lib/drawing-session.svelte";
import { ListManager } from "./list-manager.svelte";

export class Scheduler extends ListManager<ScheduleEntry> {
    static DEFAULT_ENTRY = { duration: 60, repeat: 1 };
    static DEFAULT_BREAK = { duration: 30, repeat: 1, isBreak: true };

    constructor(schedule: SessionSchedule = []) {
        super(schedule);
    }

    get schedule() {
        return this.items;
    }

    get totalImgs() {
        return this.schedule.reduce((acc, entry) => acc + (entry.isBreak ? 0 : entry.repeat), 0);
    }

    get totalDuration() {
        return this.schedule.reduce((acc, entry) => acc + entry.duration * entry.repeat, 0);
    }

    addEntry = (newEntry: ScheduleEntry | undefined = undefined) => {
        if (newEntry === undefined) {
            newEntry = { ...Scheduler.DEFAULT_ENTRY, id: self.crypto.randomUUID() };
        }
        this.addItem(newEntry);
    };

    addBreak = () => {
        this.addEntry({ ...Scheduler.DEFAULT_BREAK, id: self.crypto.randomUUID() });
    };
}
