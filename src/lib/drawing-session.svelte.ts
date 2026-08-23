import type { SessionSchedule } from "$lib/store/session-settings.svelte";
import { totalDuration, totalImgs } from "$lib/store/session-settings.svelte";
import type { Image } from "$lib/types";

export class DrawingSession {
    completedDrawings: number;
    // Time remaining for the current image to be displayed, in seconds
    timeRemaining: number;
    // Total time spent drawing (not paused), in seconds
    timeSpent: number;
    isPaused: boolean;
    isFinished: boolean;
    // Index of the current image being used
    curImgIdx: number;
    // Index of the current schedule entry being used
    curEntryIdx: number;
    // Number of times the current schedule entry has repeated
    curRepeatIdx: number;
    // Timer interval that updates the time remaining with each tick
    #timer: NodeJS.Timeout | undefined = undefined;

    constructor(
        // Array of images to be displayed in the session
        public imgs: Image[],
        // Time each image is displayed for, in seconds
        public schedule: SessionSchedule,
    ) {
        this.completedDrawings = $state(0);
        this.timeRemaining = $state(schedule.length > 0 ? schedule[0].duration : 0);
        this.timeSpent = 0;

        this.isPaused = $state(true);
        this.isFinished = $state(false);

        this.curImgIdx = $state(0);
        this.curEntryIdx = $state(0);
        this.curRepeatIdx = $state(0);

        this.#timer = undefined;
    }

    get totalImgs() {
        return totalImgs(this.schedule);
    }

    get totalDuration() {
        return totalDuration(this.schedule);
    }

    get curImg() {
        if (this.curScheduleEntry.isBreak) return undefined;
        return this.imgs[this.curImgIdx];
    }

    get curScheduleEntry() {
        return this.schedule[this.curEntryIdx];
    }

    get curImgNum() {
        return (
            totalImgs(this.schedule.slice(0, this.curEntryIdx)) +
            (this.curScheduleEntry.isBreak ? 0 : this.curRepeatIdx + 1)
        );
    }

    get curSessionTime() {
        const curDuration = this.curScheduleEntry.duration;
        return (
            totalDuration(this.schedule.slice(0, this.curEntryIdx)) +
            this.curRepeatIdx * curDuration +
            curDuration -
            this.timeRemaining
        );
    }

    isValid = () => {
        return this.imgs.length > 0 && this.schedule.length > 0;
    };

    goNextImg = () => {
        this.curImgIdx++;
        if (this.curImgIdx >= this.imgs.length) this.curImgIdx = 0;
    };

    goPrevImg = () => {
        this.curImgIdx--;
        if (this.curImgIdx < 0) this.curImgIdx = this.imgs.length - 1;
    };

    goPrevInterval = () => {
        if (this.isFinished) return;

        // Go to the previous interval (does nothing if already at the first interval)
        if (this.curRepeatIdx !== 0 || this.curEntryIdx !== 0) {
            this.curRepeatIdx -= 1;
            if (this.curRepeatIdx < 0) {
                this.curEntryIdx -= 1;
                this.curRepeatIdx = Math.max(0, this.curScheduleEntry.repeat - 1);
            }
        }

        // Reset timer
        this.timeRemaining = this.curScheduleEntry.duration;
        if (!this.isPaused) this.#restartTimer();
    };

    goNextInterval = () => {
        if (this.isFinished) return;

        // Go to the next interval (or finish session if no more intervals)
        if (
            this.curRepeatIdx === this.curScheduleEntry.repeat - 1 &&
            this.curEntryIdx === this.schedule.length - 1
        ) {
            this.finishSession();
            return;
        }
        this.curRepeatIdx += 1;
        if (this.curRepeatIdx >= this.curScheduleEntry.repeat) {
            this.curRepeatIdx = 0;
            this.curEntryIdx += 1;
        }

        // Reset timer
        this.timeRemaining = this.curScheduleEntry.duration;
        if (!this.isPaused) this.#restartTimer();
    };

    // Mark an interval as finished without interruption, and go to the next one
    finishInterval = () => {
        if (!this.curScheduleEntry.isBreak) {
            this.completedDrawings += 1;
            this.goNextImg();
        }
        this.goNextInterval();
    };

    finishSession = () => {
        this.isFinished = true;
        this.#clearTimer();
    };

    pause = () => {
        if (this.isFinished) return;
        this.isPaused = true;
        this.#clearTimer();
    };

    resume = () => {
        if (this.isFinished) return;
        this.isPaused = false;
        this.#restartTimer();
    };

    togglePause = () => {
        if (this.isPaused) this.resume();
        else this.pause();
    };

    #restartTimer = () => {
        this.#clearTimer();
        this.#timer = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.timeSpent++;
            } else {
                this.finishInterval();
            }
        }, 1000);
    };

    #clearTimer = () => {
        clearInterval(this.#timer);
    };
}

export const currentSession = $state({
    object: new DrawingSession([], []),
});
