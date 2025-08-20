import { type Image } from "$lib/types.svelte";

export type SessionSchedule = {
    time: number; // Time in seconds to show each image
    repeat: number; // Number of images to show for this time (Infinity for endless sessions)
}[];

export class DrawingSession {
    nCompletedImgs: number;
    // Time remaining for the current image to be displayed, in seconds
    timeRemaining: number;
    // Total time spent drawing (not paused), in seconds
    timeSpent: number;
    isPaused: boolean;
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
        this.timeRemaining = $state(schedule[0].time);
        this.timeSpent = 0;
        this.isPaused = $state(true);

        this.curImgIdx = $state(0);
        this.curScheduleIdx = $state(0);
        this.curScheduleRepeat = $state(0);
        this.#timer = undefined;
    }

    isValid = () => {
        return this.imgs.length > 0 && this.schedule[0].time > 0;
    };

    getCurImg = () => {
        return this.imgs[this.curImgIdx];
    };

    goPrevImg = () => {
        this.curImgIdx -= 1;
        if (this.curImgIdx < 0) this.curImgIdx = this.imgs.length - 1;
        this.timeRemaining = this.imgShowTime;
        if (!this.isPaused) this.#restartTimer();
    };

    goNextImg = () => {
        this.curImgIdx += 1;
        if (this.curImgIdx >= this.imgs.length) this.curImgIdx = 0;
        this.timeRemaining = this.imgShowTime;
        if (!this.isPaused) this.#restartTimer();
    };

    get imgShowTime() {
        return this.schedule[this.curScheduleIdx].time;
    }

    pause = () => {
        this.isPaused = true;
        this.#clearTimer();
    };

    resume = () => {
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
                this.nCompletedImgs += 1;
                this.goNextImg();
            }
        }, 1000);
    };

    #clearTimer = () => {
        clearInterval(this.#timer);
    };
}

export const currentSession = $state({
    object: new DrawingSession([], [{ time: 0, repeat: Infinity }]),
});
