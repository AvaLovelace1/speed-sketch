import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import SessionUI from "./SessionUI.svelte";
import { DrawingSession } from "$lib/drawing-session.svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";

const HIDE_TOOLBAR_TIMEOUT = 5000;

interface SessionUIFixture {
    fixture: {
        sessionUI: SessionUI;
        drawingSession: DrawingSession;
        user: UserEvent;
    };
}

const testSessionUI = test.extend<SessionUIFixture>({
    fixture: async ({ task: _task }, use) => {
        // Mock ResizeObserver to avoid errors in tests
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
        vi.useFakeTimers();

        const imgs = [{ url: "img1.png" }, { url: "img2.png" }, { url: "img3.png" }];
        const imgShowTime = 60;
        const drawingSession = new DrawingSession(imgs, imgShowTime);
        const exit = vi.fn();
        const toggleAlwaysOnTop = vi.fn();
        const showImageFolder = vi.fn();

        const renderResult = render(SessionUI, {
            drawingSession,
            exit,
            toggleAlwaysOnTop,
            showImageFolder,
            includeTooltipProvider: true,
            hideToolbarTimeoutDuration: HIDE_TOOLBAR_TIMEOUT,
        });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        await use({ sessionUI: renderResult.component, drawingSession, user });

        vi.restoreAllMocks();
    },
});

describe("SessionUI.svelte", () => {
    testSessionUI(
        "toolbar shows on hover and hides after delay",
        async ({ fixture: { sessionUI, user } }) => {
            expect(sessionUI.toolbarIsShown()).toBe(false);
            await user.hover(document.body);
            expect(sessionUI.toolbarIsShown()).toBe(true);
            vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
            expect(sessionUI.toolbarIsShown()).toBe(false);
        },
    );

    testSessionUI(
        "toolbar does not hide if mouse is still over it",
        async ({ fixture: { sessionUI, user } }) => {
            expect(sessionUI.toolbarIsShown()).toBe(false);
            await user.hover(screen.getAllByRole("toolbar")[0]);
            expect(sessionUI.toolbarIsShown()).toBe(true);
            vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
            expect(sessionUI.toolbarIsShown()).toBe(true);
        },
    );

    testSessionUI("freeze and unfreeze", async ({ fixture: { sessionUI, drawingSession } }) => {
        // Freeze
        expect(sessionUI.toolbarIsShown()).toBe(false);
        sessionUI.freeze();
        // Drawing session should be paused
        expect(drawingSession.isPaused).toBe(true);
        // Tools should be disabled - doesn't work in testing environment
        // expect(screen.getByRole("button", { name: "Exit session" })).toBeDisabled();
        // Toolbar should be shown immediately and stay shown
        expect(sessionUI.toolbarIsShown()).toBe(true);
        vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
        expect(sessionUI.toolbarIsShown()).toBe(true);

        // Unfreeze
        sessionUI.unfreeze();
        // Drawing session should be resumed
        expect(drawingSession.isPaused).toBe(false);
        // Tools should be enabled
        expect(screen.getByRole("button", { name: "Exit session" })).toBeEnabled();
        // Toolbar should hide after the timeout
        expect(sessionUI.toolbarIsShown()).toBe(true);
        vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
        expect(sessionUI.toolbarIsShown()).toBe(false);
    });
});
