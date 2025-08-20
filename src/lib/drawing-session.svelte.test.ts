import { describe, expect, test as base, vi } from "vitest";
import { DrawingSession } from "./drawing-session.svelte";

const IMGS = [
    { name: "image1.jpg", url: "https://localhost/image1.jpg" },
    { name: "image2.jpg", url: "https://localhost/image2.jpg" },
    { name: "image3.jpg", url: "https://localhost/image3.jpg" },
];

const SCHEDULE = [
    { time: 60, repeat: 3 },
    { time: 30, repeat: 3 },
    { time: 45, repeat: 1 },
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

describe("drawing-session.svelte.ts", () => {
    test("initialization", ({ session }) => {
        expect(session.imgs).toEqual(IMGS);
        expect(session.nCompletedImgs).toBe(0);
        expect(session.schedule).toBe(SCHEDULE);
        expect(session.timeRemaining).toBe(SCHEDULE[0].time);
        expect(session.timeSpent).toBe(0);
        expect(session.isPaused).toBe(true);
    });

    test("goPrevImg and goNextImg", ({ session }) => {
        session.goNextImg();
        expect(session.getCurImg()).toEqual(IMGS[1]);
        session.goNextImg();
        expect(session.getCurImg()).toEqual(IMGS[2]);
        session.goNextImg();
        expect(session.getCurImg()).toEqual(IMGS[0]);
        session.goPrevImg();
        expect(session.getCurImg()).toEqual(IMGS[2]);
        session.goPrevImg();
        expect(session.getCurImg()).toEqual(IMGS[1]);
    });

    test("goNextImg and goPrevImg reset timer", ({ session }) => {
        session.resume();

        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(SCHEDULE[0].time - 9);
        session.goNextImg();
        expect(session.timeRemaining).toBe(SCHEDULE[0].time);

        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(SCHEDULE[0].time - 9);
        session.goPrevImg();
        expect(session.timeRemaining).toBe(SCHEDULE[0].time);
    });

    test("goNextImg and goPrevImg don't restart timer when paused", ({ session }) => {
        session.pause();
        const prevTimeRemaining = session.timeRemaining;

        session.goNextImg();
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);

        session.goPrevImg();
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);
    });

    test("resume and pause", ({ session }) => {
        session.resume();
        expect(session.isPaused).toBe(false);
        const waitTimeSeconds = 3;
        vi.advanceTimersByTime(waitTimeSeconds * 1000);
        expect(session.timeRemaining).toBe(SCHEDULE[0].time - waitTimeSeconds);

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
        vi.advanceTimersByTime((SCHEDULE[0].time + 1) * 1000);
        expect(session.nCompletedImgs).toBe(1);
        expect(session.getCurImg()).toEqual(IMGS[1]);
        expect(session.timeRemaining).toBe(SCHEDULE[0].time);
    });

    test("go to next schedule entry", ({ session }) => {
        session.resume();
        for (let i = 0; i < SCHEDULE[0].repeat - 1; i++) {
            vi.advanceTimersByTime((SCHEDULE[0].time + 1) * 1000);
            expect(session.timeRemaining).toBe(SCHEDULE[0].time);
        }
        vi.advanceTimersByTime((SCHEDULE[0].time + 1) * 1000);
        expect(session.timeRemaining).toBe(SCHEDULE[1].time);
    });

    test("finish session when all schedule entries are done", ({ session }) => {
        session.resume();
        for (const sessionEntry of SCHEDULE) {
            for (let i = 0; i < sessionEntry.repeat; i++) {
                vi.advanceTimersByTime((sessionEntry.time + 1) * 1000);
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
});
