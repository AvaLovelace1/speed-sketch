import { type Image } from "$lib/types.svelte";

export type ScheduleEntry = {
    duration: number; // Time in seconds to show each image
    repeat: number; // Number of images to show for this time (Infinity for endless sessions)
    id?: string; // UUID for the schedule entry, useful for tracking
};

export type SessionSchedule = ScheduleEntry[];

export class DrawingSession {
    nCompletedImgs: number;
    // Time remaining for the current image to be displayed, in seconds
    timeRemaining: number;
    // Total time spent drawing (not paused), in seconds
    timeSpent: number;
    isPaused: boolean;
    isFinished: boolean;
    // Index of the current image being displayed
    curImgIdx: number;
    // Index of the current schedule entry being used
    curScheduleIdx: number;
    // Number of times the current schedule entry has repeated
    curScheduleRepeat: number;
    // Timer interval that updates the time remaining with each tick
    #timer: NodeJS.Timeout | undefined = undefined;

    constructor(
        // Array of images to be displayed in the session
        public imgs: Image[],
        // Time each image is displayed for, in seconds
        public schedule: SessionSchedule,
    ) {
        this.nCompletedImgs = $state(0);
        this.timeRemaining = $state(schedule[0].duration);
        this.timeSpent = 0;
        this.isPaused = $state(true);
        this.isFinished = $state(false);

        this.curImgIdx = $state(0);
        this.curScheduleIdx = $state(0);
        this.curScheduleRepeat = $state(0);
        this.#timer = undefined;
    }

    get totalImgs() {
        return this.schedule.reduce((acc, entry) => acc + entry.repeat, 0);
    }

    isValid = () => {
        return this.imgs.length > 0 && this.schedule[0].duration > 0;
    };

    getCurImg = () => {
        return this.imgs[this.curImgIdx];
    };

    getCurScheduleEntry = () => {
        return this.schedule[this.curScheduleIdx];
    };

    goPrevImg = () => {
        if (this.isFinished) return;
        this.curImgIdx -= 1;
        if (this.curImgIdx < 0) this.curImgIdx = this.imgs.length - 1;
        this.timeRemaining = this.getCurScheduleEntry().duration;
        if (!this.isPaused) this.#restartTimer();
    };

    goNextImg = () => {
        if (this.isFinished) return;
        this.curImgIdx += 1;
        if (this.curImgIdx >= this.imgs.length) this.curImgIdx = 0;
        this.timeRemaining = this.getCurScheduleEntry().duration;
        if (!this.isPaused) this.#restartTimer();
    };

    finishImg = () => {
        this.nCompletedImgs += 1;

        if (
            this.curScheduleRepeat === this.getCurScheduleEntry().repeat - 1 &&
            this.curScheduleIdx === this.schedule.length - 1
        ) {
            this.finishSession();
            return;
        }

        this.curScheduleRepeat += 1;
        if (this.curScheduleRepeat >= this.getCurScheduleEntry().repeat) {
            this.curScheduleRepeat = 0;
            this.curScheduleIdx += 1;
        }
        this.goNextImg();
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
        this.#timer = setInterval(async () => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.timeSpent++;
            } else {
                this.finishImg();
            }
        }, 1000);
    };

    #clearTimer = () => {
        clearInterval(this.#timer);
    };
}

export const currentSession = $state({
    object: new DrawingSession([], [{ duration: 0, repeat: Infinity }]),
});
