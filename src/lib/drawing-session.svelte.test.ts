import { describe, expect, test as base, vi } from "vitest";
import { DrawingSession } from "./drawing-session.svelte";

const IMGS = [
    { name: "image1.jpg", url: "https://localhost/image1.jpg" },
    { name: "image2.jpg", url: "https://localhost/image2.jpg" },
    { name: "image3.jpg", url: "https://localhost/image3.jpg" },
];

const SCHEDULE = [
    { duration: 60, repeat: 3 },
    { duration: 30, repeat: 3 },
    { duration: 45, repeat: 1 },
];

const BREAK_SCHEDULE = [
    { duration: 60, repeat: 2 },
    { duration: 10, repeat: 1, isBreak: true },
    { duration: 45, repeat: 3 },
];

interface DrawingSessionFixture {
    session: DrawingSession;
}

const test = base.extend<DrawingSessionFixture>({
    session: async ({ task: _task }, use) => {
        vi.useFakeTimers();
        const session = new DrawingSession(IMGS, SCHEDULE);
        await use(session);
        vi.restoreAllMocks();
    },
});

const testWithBreaks = base.extend<DrawingSessionFixture>({
    session: async ({ task: _task }, use) => {
        vi.useFakeTimers();
        const session = new DrawingSession(IMGS, BREAK_SCHEDULE);
        await use(session);
        vi.restoreAllMocks();
    },
});

describe("drawing-session.svelte.ts", () => {
    test("initialization", ({ session }) => {
        expect(session.imgs).toEqual(IMGS);
        expect(session.nCompletedImgs).toBe(0);
        expect(session.schedule).toBe(SCHEDULE);
        expect(session.timeRemaining).toBe(SCHEDULE[0].duration);
        expect(session.timeSpent).toBe(0);
        expect(session.isPaused).toBe(true);
    });

    test("goPrevInterval and goNextInterval", ({ session }) => {
        session.goNextInterval();
        expect(session.getCurImg()).toEqual(IMGS[1]);
        session.goNextInterval();
        expect(session.getCurImg()).toEqual(IMGS[2]);
        session.goNextInterval();
        expect(session.getCurImg()).toEqual(IMGS[0]);
        session.goPrevInterval();
        expect(session.getCurImg()).toEqual(IMGS[2]);
        session.goPrevInterval();
        expect(session.getCurImg()).toEqual(IMGS[1]);
        session.goPrevInterval();
        expect(session.getCurImg()).toEqual(IMGS[0]);
        session.goPrevInterval();
        expect(session.getCurImg()).toEqual(IMGS[0]); // Can't go back past the first interval
    });

    test("goNextInterval and goPrevInterval reset timer", ({ session }) => {
        session.resume();

        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(SCHEDULE[0].duration - 9);
        session.goNextInterval();
        expect(session.timeRemaining).toBe(SCHEDULE[0].duration);

        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(SCHEDULE[0].duration - 9);
        session.goPrevInterval();
        expect(session.timeRemaining).toBe(SCHEDULE[0].duration);
    });

    test("goNextInterval and goPrevInterval don't restart timer when paused", ({ session }) => {
        session.pause();
        const prevTimeRemaining = session.timeRemaining;

        session.goNextInterval();
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);

        session.goPrevInterval();
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);
    });

    test("resume and pause", ({ session }) => {
        session.resume();
        expect(session.isPaused).toBe(false);
        const waitTimeSeconds = 3;
        vi.advanceTimersByTime(waitTimeSeconds * 1000);
        expect(session.timeRemaining).toBe(SCHEDULE[0].duration - waitTimeSeconds);

        session.pause();
        expect(session.isPaused).toBe(true);
        const prevTimeRemaining = session.timeRemaining;
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);
    });

    test("togglePause", ({ session }) => {
        session.togglePause();
        expect(session.isPaused).toBe(false);
        session.togglePause();
        expect(session.isPaused).toBe(true);
    });

    test("advance image when time runs out", ({ session }) => {
        session.resume();
        vi.advanceTimersByTime((SCHEDULE[0].duration + 1) * 1000);
        expect(session.nCompletedImgs).toBe(1);
        expect(session.getCurImg()).toEqual(IMGS[1]);
        expect(session.timeRemaining).toBe(SCHEDULE[0].duration);
    });

    test("go to next schedule entry", ({ session }) => {
        session.resume();
        for (let i = 0; i < SCHEDULE[0].repeat - 1; i++) {
            vi.advanceTimersByTime((SCHEDULE[0].duration + 1) * 1000);
            expect(session.timeRemaining).toBe(SCHEDULE[0].duration);
        }
        vi.advanceTimersByTime((SCHEDULE[0].duration + 1) * 1000);
        expect(session.timeRemaining).toBe(SCHEDULE[1].duration);
    });

    test("finish session when all schedule entries are done", ({ session }) => {
        session.resume();
        for (const sessionEntry of SCHEDULE) {
            for (let i = 0; i < sessionEntry.repeat; i++) {
                vi.advanceTimersByTime((sessionEntry.duration + 1) * 1000);
                const isFinished =
                    i === sessionEntry.repeat - 1 && sessionEntry === SCHEDULE[SCHEDULE.length - 1];
                expect(session.isFinished).toBe(isFinished);
            }
        }
    });

    test("finish session via goNextInterval", ({ session }) => {
        session.resume();
        for (const sessionEntry of SCHEDULE) {
            for (let i = 0; i < sessionEntry.repeat; i++) {
                session.goNextInterval();
                const isFinished =
                    i === sessionEntry.repeat - 1 && sessionEntry === SCHEDULE[SCHEDULE.length - 1];
                expect(session.isFinished).toBe(isFinished);
            }
        }
    });

    test("timeSpent increments correctly", ({ session }) => {
        session.resume();
        const waitTimeSeconds = 3;
        vi.advanceTimersByTime(waitTimeSeconds * 1000);
        session.pause();
        vi.advanceTimersByTime(9000);
        expect(session.timeSpent).toBe(waitTimeSeconds);
    });

    testWithBreaks("full session with breaks", ({ session }) => {
        expect(session.totalImgs).toBe(BREAK_SCHEDULE[0].repeat + BREAK_SCHEDULE[2].repeat);
        session.resume();

        // Finish first entry
        for (let i = 0; i < BREAK_SCHEDULE[0].repeat; i++) {
            vi.advanceTimersByTime((BREAK_SCHEDULE[0].duration + 1) * 1000);
        }

        // On break
        expect(session.getCurScheduleEntry().isBreak).toBe(true);
        expect(session.getCurImg()).toBeUndefined();

        // Finish the break
        vi.advanceTimersByTime((BREAK_SCHEDULE[1].duration + 1) * 1000);
        expect(session.nCompletedImgs).toBe(BREAK_SCHEDULE[0].repeat); // nCompletedImgs is unchanged

        // Now on schedule entry 2
        expect(session.getCurScheduleEntry()).toBe(BREAK_SCHEDULE[2]);
        expect(session.timeRemaining).toBe(BREAK_SCHEDULE[2].duration);
        expect(session.getCurImg()).toBeDefined();

        // Finish second entry
        for (let i = 0; i < BREAK_SCHEDULE[2].repeat; i++) {
            vi.advanceTimersByTime((BREAK_SCHEDULE[2].duration + 1) * 1000);
        }

        // Session is finished
        expect(session.isFinished).toBe(true);
        expect(session.nCompletedImgs).toBe(BREAK_SCHEDULE[0].repeat + BREAK_SCHEDULE[2].repeat); // only non-break entries counted
    });

    testWithBreaks(
        "goPrevInterval and goNextInterval don't change image index when exiting break",
        ({ session }) => {
            expect(session.getCurImg()).toEqual(IMGS[0]); // Entry 0, interval 0
            session.goNextInterval();
            expect(session.getCurImg()).toEqual(IMGS[1]); // Entry 0, interval 1
            session.goNextInterval();
            expect(session.getCurImg()).toBeUndefined(); // Entry 1 (break)
            session.goNextInterval();
            expect(session.getCurImg()).toEqual(IMGS[2]); // Entry 2, interval 0
            session.goNextInterval();
            expect(session.getCurImg()).toEqual(IMGS[0]); // Entry 2, interval 1
            session.goPrevInterval();
            expect(session.getCurImg()).toEqual(IMGS[2]); // Entry 2, interval 0
            session.goPrevInterval();
            expect(session.getCurImg()).toBeUndefined(); // Entry 1 (break)
            session.goNextInterval();
            expect(session.getCurImg()).toEqual(IMGS[2]); // Entry 2, interval 0
            session.goPrevInterval();
            expect(session.getCurImg()).toBeUndefined(); // Entry 1 (break)
            session.goPrevInterval();
            expect(session.getCurImg()).toEqual(IMGS[1]); // Entry 0, interval 1
            session.goPrevInterval();
            expect(session.getCurImg()).toEqual(IMGS[0]); // Entry 0, interval 0
        },
    );

    testWithBreaks("timer counts down during break", ({ session }) => {
        session.resume();
        // Finish 2 images
        for (let i = 0; i < 2; i++) {
            vi.advanceTimersByTime((BREAK_SCHEDULE[0].duration + 1) * 1000);
        }
        // On break
        expect(session.timeRemaining).toBe(BREAK_SCHEDULE[1].duration);
        vi.advanceTimersByTime(5000);
        expect(session.timeRemaining).toBe(BREAK_SCHEDULE[1].duration - 5);
    });

    const totalTimeRemaining = SCHEDULE.reduce(
        (acc, entry) => acc + entry.duration * entry.repeat,
        0,
    );

    test("totalTimeRemaining at start", ({ session }) => {
        expect(session.totalTimeRemaining).toBe(totalTimeRemaining);
    });

    test("totalTimeRemaining decreases with timer", ({ session }) => {
        const timeSpent = 10;
        session.resume();
        vi.advanceTimersByTime(timeSpent * 1000);
        expect(session.totalTimeRemaining).toBe(totalTimeRemaining - timeSpent);
    });

    test("totalTimeRemaining after advancing intervals", ({ session }) => {
        // Advance past all of entry 0
        for (let i = 0; i < SCHEDULE[0].repeat; i++) {
            session.goNextInterval();
        }
        // Now at entry 1, repeat 0
        expect(session.totalTimeRemaining).toBe(
            totalTimeRemaining - SCHEDULE[0].duration * SCHEDULE[0].repeat,
        );
        // Advance timer
        session.resume();
        const timeSpent = 10;
        vi.advanceTimersByTime(timeSpent * 1000);
        expect(session.totalTimeRemaining).toBe(
            totalTimeRemaining - SCHEDULE[0].duration * SCHEDULE[0].repeat - timeSpent,
        );
    });

    const totalTimeRemainingBreakSchedule = BREAK_SCHEDULE.reduce(
        (acc, entry) => acc + entry.duration * entry.repeat,
        0,
    );

    testWithBreaks("totalTimeRemaining includes break durations", ({ session }) => {
        expect(session.totalTimeRemaining).toBe(totalTimeRemainingBreakSchedule);
    });
});
