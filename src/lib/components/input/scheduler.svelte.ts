import type { ScheduleEntry, SessionSchedule } from "$lib/store/session-settings.svelte";
import { totalImgs, totalDuration } from "$lib/store/session-settings.svelte";
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
        return totalImgs(this.schedule);
    }

    get totalDuration() {
        return totalDuration(this.schedule);
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
