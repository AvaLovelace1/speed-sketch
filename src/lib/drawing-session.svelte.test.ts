import { describe, expect, test as base, vi } from "vitest";
import { DrawingSession } from "./drawing-session.svelte";

const test = base
    .extend("imgs", ({ task: _task }) => [
        { name: "image1.jpg", url: "https://localhost/image1.jpg" },
        { name: "image2.jpg", url: "https://localhost/image2.jpg" },
        { name: "image3.jpg", url: "https://localhost/image3.jpg" },
    ])
    .extend("schedule", ({ task: _task }) => [
        { duration: 60, repeat: 2, id: "1" },
        { duration: 10, repeat: 1, id: "2", isBreak: true },
        { duration: 45, repeat: 3, id: "3" },
    ])
    .extend("session", ({ imgs, schedule }, { onCleanup }) => {
        vi.useFakeTimers();
        onCleanup(() => {
            vi.restoreAllMocks();
        });
        return new DrawingSession(imgs, schedule);
    });

// Assert that the session timer is ticking.
// This is not a pure function; it advances time and modifies timeRemaining/timeSpent.
function expectTimerIsTicking(session: DrawingSession) {
    const prevTimeRemaining = session.timeRemaining;
    const prevTimeSpent = session.timeSpent;
    const delta = Math.ceil(prevTimeRemaining / 2);
    expect(delta).toBeGreaterThan(0);
    vi.advanceTimersByTime(delta * 1000);
    expect(session.timeRemaining).toBe(prevTimeRemaining - delta);
    expect(session.timeSpent).toBe(prevTimeSpent + delta);
}

function expectTimerNotTicking(session: DrawingSession) {
    const prevTimeRemaining = session.timeRemaining;
    const prevTimeSpent = session.timeSpent;
    vi.advanceTimersByTime(9000);
    expect(session.timeRemaining).toBe(prevTimeRemaining);
    expect(session.timeSpent).toBe(prevTimeSpent);
}

describe("drawing-session.svelte.ts", () => {
    test("initial properties are correct", ({ imgs, schedule, session }) => {
        expect(session.imgs).toEqual(imgs);
        expect(session.schedule).toBe(schedule);
        expect(session.completedDrawings).toBe(0);
        expect(session.timeRemaining).toBe(schedule[0].duration);
        expect(session.timeSpent).toBe(0);
        expect(session.isPaused).toBe(true);
        expect(session.isFinished).toBe(false);
        expect(session.curImgIdx).toBe(0);
        expect(session.curEntryIdx).toBe(0);
        expect(session.curRepeatIdx).toBe(0);
    });

    describe("totalImgs", () => {
        test("sums all repeats (not including breaks)", ({ session }) => {
            expect(session.totalImgs).toBe(5);
        });

        test("is Infinity on endless schedule", ({ imgs }) => {
            const session = new DrawingSession(imgs, [{ duration: 60, repeat: Infinity, id: "1" }]);
            expect(session.totalImgs).toBe(Infinity);
        });
    });

    describe("totalDuration", () => {
        test("sums all durations (including breaks)", ({ session }) => {
            expect(session.totalDuration).toBe(60 * 2 + 10 + 45 * 3);
        });

        test("is Infinity on endless schedule", ({ imgs }) => {
            const session = new DrawingSession(imgs, [{ duration: 60, repeat: Infinity, id: "1" }]);
            expect(session.totalDuration).toBe(Infinity);
        });
    });

    describe("getters", () => {
        test("curImg returns selected image", ({ session }) => {
            session.curImgIdx = 0;
            expect(session.curImg).toEqual(session.imgs[0]);
            session.curImgIdx = 2;
            expect(session.curImg).toEqual(session.imgs[2]);
        });

        test("curImg returns undefined if current entry is break", ({ session }) => {
            session.curEntryIdx = 1;
            session.curRepeatIdx = 0;
            expect(session.curImg).toBeUndefined();
        });

        test("curScheduleEntry returns selected schedule entry", ({ session }) => {
            session.curEntryIdx = 0;
            expect(session.curScheduleEntry).toEqual(session.schedule[0]);
            session.curEntryIdx = 2;
            expect(session.curScheduleEntry).toEqual(session.schedule[2]);
        });
    });

    describe("curImgNum", () => {
        test("starts at 1", ({ session }) => {
            expect(session.curImgNum).toBe(1);
        });

        test("sums previous (non-break) interval repeats", ({ session }) => {
            session.curEntryIdx = 2;
            session.curRepeatIdx = 1;
            expect(session.curImgNum).toBe(4);
        });

        test("does not increment when on break", ({ session }) => {
            session.curEntryIdx = 1;
            session.curRepeatIdx = 0;
            expect(session.curImgNum).toBe(2);
        });
    });

    describe("curSessionTime", () => {
        test("starts at 0", ({ session }) => {
            expect(session.curSessionTime).toBe(0);
        });

        test("sums previous interval durations + (current duration - timeRemaining)", ({
            session,
        }) => {
            session.curEntryIdx = 2;
            session.curRepeatIdx = 1;
            session.timeRemaining = 10;
            expect(session.curSessionTime).toBe(60 * 2 + 10 + 45 + (45 - 10));
        });
    });

    describe("isValid", () => {
        test("session with no images is invalid", ({ schedule }) => {
            const session = new DrawingSession([], schedule);
            expect(session.isValid()).toBe(false);
        });

        test("session with empty schedule is invalid", ({ imgs }) => {
            const session = new DrawingSession(imgs, []);
            expect(session.isValid()).toBe(false);
        });
    });

    describe("image navigation", () => {
        test("goNextImg goes to next image", ({ session }) => {
            session.curImgIdx = 0;
            session.goNextImg();
            expect(session.curImgIdx).toBe(1);
        });

        test("goNextImg loops around if on last image", ({ session }) => {
            session.curImgIdx = 2;
            session.goNextImg();
            expect(session.curImgIdx).toBe(0);
        });

        test("goPrevImg goes to previous image", ({ session }) => {
            session.curImgIdx = 1;
            session.goPrevImg();
            expect(session.curImgIdx).toBe(0);
        });

        test("goPrevImg loops around if on first image", ({ session }) => {
            session.curImgIdx = 0;
            session.goPrevImg();
            expect(session.curImgIdx).toBe(2);
        });
    });

    describe("interval navigation", () => {
        test("goNextInterval goes to next repeat", ({ session }) => {
            session.curEntryIdx = 0;
            session.curRepeatIdx = 0;
            session.goNextInterval();
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(1);
        });

        test("goNextInterval goes to first repeat of next entry if on last repeat", ({
            session,
        }) => {
            session.curEntryIdx = 0;
            session.curRepeatIdx = 1;
            session.goNextInterval();
            expect(session.curEntryIdx).toBe(1);
            expect(session.curRepeatIdx).toBe(0);
        });

        test("goPrevInterval goes to previous repeat", ({ session }) => {
            session.curEntryIdx = 0;
            session.curRepeatIdx = 1;
            session.goPrevInterval();
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(0);
        });

        test("goPrevInterval goes to last repeat of previous entry if on first repeat", ({
            session,
        }) => {
            session.curEntryIdx = 1;
            session.curRepeatIdx = 0;
            session.goPrevInterval();
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(1);
        });

        test("goNextInterval finishes session if on last repeat of last interval", ({
            session,
        }) => {
            session.curEntryIdx = 2;
            session.curRepeatIdx = 1;

            session.goNextInterval();
            expect(session.curEntryIdx).toBe(2);
            expect(session.curRepeatIdx).toBe(2);
            expect(session.isFinished).toBe(false);

            session.goNextInterval();
            expect(session.curEntryIdx).toBe(2);
            expect(session.curRepeatIdx).toBe(2);
            expect(session.isFinished).toBe(true);
        });

        test("goPrevInterval is no-op on first repeat of first interval", ({ session }) => {
            session.curEntryIdx = 0;
            session.curRepeatIdx = 0;
            session.goPrevInterval();
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(0);
        });

        test("goPrevInterval resets time remaining without affecting timeSpent", ({
            schedule,
            session,
        }) => {
            session.resume();
            const timeSpent = 10;
            vi.advanceTimersByTime(timeSpent * 1000);
            expect(session.timeRemaining).toBe(schedule[0].duration - timeSpent);
            expect(session.timeSpent).toBe(timeSpent);
            session.goPrevInterval();
            expect(session.timeRemaining).toBe(schedule[0].duration);
            expect(session.timeSpent).toBe(timeSpent);
        });

        test("goNextInterval resets time remaining without affecting timeSpent", ({
            schedule,
            session,
        }) => {
            session.resume();
            const timeSpent = 10;
            vi.advanceTimersByTime(timeSpent * 1000);
            expect(session.timeRemaining).toBe(schedule[0].duration - timeSpent);
            expect(session.timeSpent).toBe(timeSpent);
            session.goNextInterval();
            expect(session.timeRemaining).toBe(schedule[0].duration);
            expect(session.timeSpent).toBe(timeSpent);
        });

        test("goNextInterval and goPrevInterval don't restart timer when paused", ({ session }) => {
            session.pause();
            session.goNextInterval();
            expectTimerNotTicking(session);
            session.goPrevInterval();
            expectTimerNotTicking(session);
        });

        test("goNextInterval and goPrevInterval do not affect curImg", ({ session }) => {
            session.curImgIdx = 0;
            session.goNextInterval();
            expect(session.curImgIdx).toEqual(0);
            session.goPrevInterval();
            expect(session.curImgIdx).toEqual(0);
        });

        test("goPrevInterval and goNextInterval are no-ops when session finished", ({
            session,
        }) => {
            session.curEntryIdx = 0;
            session.curRepeatIdx = 1;
            session.finishSession();

            session.goPrevInterval();
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(1);

            session.goNextInterval();
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(1);
        });
    });

    describe("finishInterval", () => {
        test("goes to next image, goes to next interval, and increments completedDrawings", ({
            session,
        }) => {
            session.curImgIdx = 0;
            session.curEntryIdx = 0;
            session.curRepeatIdx = 0;
            session.completedDrawings = 0;
            session.finishInterval();
            expect(session.curImgIdx).toBe(1);
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(1);
            expect(session.completedDrawings).toBe(1);
        });

        test("doesn't increment completedDrawings or go to next image if interval is break", ({
            session,
        }) => {
            session.curImgIdx = 0;
            session.curEntryIdx = 1;
            session.curRepeatIdx = 0;
            session.completedDrawings = 0;
            session.finishInterval();
            expect(session.curImgIdx).toBe(0);
            expect(session.curEntryIdx).toBe(2);
            expect(session.curRepeatIdx).toBe(0);
            expect(session.completedDrawings).toBe(0);
        });
    });

    test("finishSession sets isFinished and clears timers", ({ session }) => {
        expect(session.isFinished).toBe(false);
        session.resume();
        session.finishSession();
        expect(session.isFinished).toBe(true);
        expectTimerNotTicking(session);
    });

    describe("pausing and resuming", () => {
        test("time advances with resume and freezes with pause", ({ session }) => {
            session.resume();
            expect(session.isPaused).toBe(false);
            expectTimerIsTicking(session);

            session.pause();
            expect(session.isPaused).toBe(true);
            expectTimerNotTicking(session);

            session.resume();
            expect(session.isPaused).toBe(false);
            expectTimerIsTicking(session);
        });

        test("togglePause flips pause state", ({ session }) => {
            session.togglePause();
            expect(session.isPaused).toBe(false);
            session.togglePause();
            expect(session.isPaused).toBe(true);
            session.togglePause();
            expect(session.isPaused).toBe(false);
        });

        test("resume does not restart timer when session finished", ({ session }) => {
            session.pause();
            session.finishSession();
            session.resume();
            expect(session.isPaused).toBe(true);
            expectTimerNotTicking(session);
        });
    });

    describe("timers", () => {
        test("finishes interval when time runs out", ({ schedule, session }) => {
            const seconds = 10;
            session.curEntryIdx = 0;
            session.curRepeatIdx = 0;
            session.timeRemaining = seconds;
            session.resume();
            vi.advanceTimersByTime((seconds + 1) * 1000);
            expect(session.curEntryIdx).toBe(0);
            expect(session.curRepeatIdx).toBe(1);
            expect(session.timeRemaining).toBe(schedule[0].duration);
        });

        test("finishes session when time runs out on final interval", ({ session }) => {
            const seconds = 10;
            session.curEntryIdx = 2;
            session.curRepeatIdx = 2;
            session.timeRemaining = seconds;
            session.resume();
            vi.advanceTimersByTime((seconds + 1) * 1000);
            expect(session.isFinished).toBe(true);
        });
    });
});
