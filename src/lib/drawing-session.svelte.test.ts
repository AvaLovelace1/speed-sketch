import { describe, expect, test, vi } from "vitest";
import { DrawingSession } from "./drawing-session.svelte";

const IMGS = [{ url: "img1.jpg" }, { url: "img2.jpg" }, { url: "img3.jpg" }];
const IMG_SHOW_TIME = 60;

interface DrawingSessionFixture {
    session: DrawingSession;
}

const testDrawingSession = test.extend<DrawingSessionFixture>({
    session: async ({ task: _task }, use) => {
        vi.useFakeTimers();
        const session = new DrawingSession(IMGS, IMG_SHOW_TIME);
        await use(session);
        vi.restoreAllMocks();
    },
});

describe("drawing-session.svelte.ts", () => {
    testDrawingSession("initialization", ({ session }) => {
        expect(session.imgs).toBe(IMGS);
        expect(session.nCompletedImgs).toBe(0);
        expect(session.imgShowTime).toBe(IMG_SHOW_TIME);
        expect(session.timeRemaining).toBe(IMG_SHOW_TIME);
        expect(session.timeSpent).toBe(0);
        expect(session.isPaused).toBe(true);
    });

    testDrawingSession("goPrevImg and goNextImg", ({ session }) => {
        session.goNextImg();
        expect(session.getCurImg()).toBe(IMGS[1]);
        session.goNextImg();
        expect(session.getCurImg()).toBe(IMGS[2]);
        session.goNextImg();
        expect(session.getCurImg()).toBe(IMGS[0]);
        session.goPrevImg();
        expect(session.getCurImg()).toBe(IMGS[2]);
        session.goPrevImg();
        expect(session.getCurImg()).toBe(IMGS[1]);
    });

    testDrawingSession("goNextImg and goPrevImg reset timer", ({ session }) => {
        session.resume();

        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(IMG_SHOW_TIME - 9);
        session.goNextImg();
        expect(session.timeRemaining).toBe(IMG_SHOW_TIME);

        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(IMG_SHOW_TIME - 9);
        session.goPrevImg();
        expect(session.timeRemaining).toBe(IMG_SHOW_TIME);
    });

    testDrawingSession("goNextImg and goPrevImg don't restart timer when paused", ({ session }) => {
        session.pause();
        const prevTimeRemaining = session.timeRemaining;

        session.goNextImg();
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);

        session.goPrevImg();
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);
    });

    testDrawingSession("resume and pause", ({ session }) => {
        session.resume();
        expect(session.isPaused).toBe(false);
        const waitTimeSeconds = 3;
        vi.advanceTimersByTime(waitTimeSeconds * 1000);
        expect(session.timeRemaining).toBe(IMG_SHOW_TIME - waitTimeSeconds);

        session.pause();
        expect(session.isPaused).toBe(true);
        const prevTimeRemaining = session.timeRemaining;
        vi.advanceTimersByTime(9000);
        expect(session.timeRemaining).toBe(prevTimeRemaining);
    });

    testDrawingSession("togglePause", ({ session }) => {
        session.togglePause();
        expect(session.isPaused).toBe(false);
        session.togglePause();
        expect(session.isPaused).toBe(true);
    });

    testDrawingSession("advance image when time runs out", ({ session }) => {
        session.resume();
        vi.advanceTimersByTime((IMG_SHOW_TIME + 1) * 1000);
        expect(session.nCompletedImgs).toBe(1);
        expect(session.getCurImg()).toBe(IMGS[1]);
        expect(session.timeRemaining).toBe(IMG_SHOW_TIME);
    });

    testDrawingSession("timeSpent increments correctly", ({ session }) => {
        session.resume();
        const waitTimeSeconds = 3;
        vi.advanceTimersByTime(waitTimeSeconds * 1000);
        session.pause();
        vi.advanceTimersByTime(9000);
        expect(session.timeSpent).toBe(waitTimeSeconds);
    });
});
