import type { SessionSchedule } from "$lib/store/session-settings.svelte";
import type { Image } from "$lib/types.svelte";

export class DrawingSession {
    completedDrawings: number;
    // Time remaining for the current image to be displayed, in seconds
    timeRemaining: number;
    // Total time spent drawing (not paused), in seconds
    timeSpent: number;
    isPaused: boolean;
    isFinished: boolean;
    // Index of the current schedule entry being used
    curEntryIdx: number;
    // Number of times the current schedule entry has repeated
    curRepeatIdx: number;
    // Timer interval that updates the time remaining with each tick
    #timer: NodeJS.Timeout | undefined = undefined;
    // Prefix sums of the (image-only) repeat counts in the schedule, used to compute the current image index
    #imgIntervalPrefixSums: number[];
    // Suffix sums of total time per schedule entry (entry duration * repeat), used to compute totalTimeRemaining
    #timeSuffixSums: number[];

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

        this.curEntryIdx = $state(0);
        this.curRepeatIdx = $state(0);
        this.#timer = undefined;

        this.#imgIntervalPrefixSums = $derived.by(() => {
            const prefixSums: number[] = [];
            for (const entry of schedule) {
                const nImgIntervals = entry.isBreak ? 0 : entry.repeat;
                if (prefixSums.length === 0) prefixSums.push(nImgIntervals);
                else prefixSums.push(prefixSums[prefixSums.length - 1] + nImgIntervals);
            }
            return prefixSums;
        });

        this.#timeSuffixSums = $derived.by(() => {
            const suffixSums: number[] = new Array(schedule.length);
            for (let i = schedule.length - 1; i >= 0; i--) {
                const entryTotal = schedule[i].duration * schedule[i].repeat;
                suffixSums[i] =
                    i === schedule.length - 1 ? entryTotal : entryTotal + suffixSums[i + 1];
            }
            return suffixSums;
        });
    }

    get totalImgs() {
        return this.schedule.reduce((acc, entry) => acc + (entry.isBreak ? 0 : entry.repeat), 0);
    }

    get totalTimeRemaining() {
        const curEntry = this.getCurScheduleEntry();
        // Time left in current interval + remaining repeats in current entry + all subsequent entries
        return (
            this.timeRemaining +
            (curEntry.repeat - 1 - this.curRepeatIdx) * curEntry.duration +
            (this.curEntryIdx < this.schedule.length - 1
                ? this.#timeSuffixSums[this.curEntryIdx + 1]
                : 0)
        );
    }

    isValid = () => {
        return this.imgs.length > 0 && this.schedule.length > 0 && this.schedule[0].duration > 0;
    };

    getCurImg = (): Image | undefined => {
        if (this.getCurScheduleEntry().isBreak) return undefined;
        const curImgIdx =
            this.curEntryIdx === 0
                ? this.curRepeatIdx
                : this.curRepeatIdx + this.#imgIntervalPrefixSums[this.curEntryIdx - 1];
        return this.imgs[curImgIdx % this.imgs.length];
    };

    getCurScheduleEntry = () => {
        return this.schedule[this.curEntryIdx];
    };

    goPrevInterval = () => {
        if (this.isFinished) return;

        // Go to the previous interval (does nothing if already at the first interval)
        if (this.curRepeatIdx !== 0 || this.curEntryIdx !== 0) {
            this.curRepeatIdx -= 1;
            if (this.curRepeatIdx < 0) {
                this.curEntryIdx -= 1;
                this.curRepeatIdx = Math.max(0, this.getCurScheduleEntry().repeat - 1);
            }
        }

        // Reset timer
        this.timeRemaining = this.getCurScheduleEntry().duration;
        if (!this.isPaused) this.#restartTimer();
    };

    goNextInterval = () => {
        if (this.isFinished) return;

        // Go to the next interval (or finish session if no more intervals)
        if (
            this.curRepeatIdx === this.getCurScheduleEntry().repeat - 1 &&
            this.curEntryIdx === this.schedule.length - 1
        ) {
            this.finishSession();
            return;
        }
        this.curRepeatIdx += 1;
        if (this.curRepeatIdx >= this.getCurScheduleEntry().repeat) {
            this.curRepeatIdx = 0;
            this.curEntryIdx += 1;
        }

        // Reset timer
        this.timeRemaining = this.getCurScheduleEntry().duration;
        if (!this.isPaused) this.#restartTimer();
    };

    // Mark an interval as finished without interruption, and go to the next one
    finishInterval = () => {
        if (!this.getCurScheduleEntry().isBreak) this.completedDrawings += 1;
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
