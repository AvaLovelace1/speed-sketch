import { describe, test as base, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import SessionScreen from "./SessionScreen.svelte";
import { DrawingSession } from "$lib/drawing-session.svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";
vi.mock("svelte/transition");

const HIDE_TOOLBAR_TIMEOUT = 5000;

interface SessionScreenFixture {
    fixture: {
        sessionScreen: SessionScreen;
        drawingSession: DrawingSession;
        user: UserEvent;
    };
}

const test = base.extend<SessionScreenFixture>({
    fixture: async ({ task: _task }, use) => {
        // Mock ResizeObserver to avoid errors in tests
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
        vi.useFakeTimers();

        const imgs = [
            { name: "image1.jpg", url: "https://localhost/image1.jpg" },
            { name: "image2.jpg", url: "https://localhost/image2.jpg" },
            { name: "image3.jpg", url: "https://localhost/image3.jpg" },
        ];
        const imgShowTime = 60;
        const drawingSession = new DrawingSession(imgs, [
            { duration: imgShowTime, repeat: Infinity },
        ]);
        const exit = vi.fn();
        const setAlwaysOnTop = vi.fn();
        const showImageFolder = vi.fn();

        const renderResult = render(SessionScreen, {
            drawingSession,
            exit,
            setAlwaysOnTop,
            showImageFolder,
            includeTooltipProvider: true,
            hideToolbarTimeoutDuration: HIDE_TOOLBAR_TIMEOUT,
        });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        await use({
            sessionScreen: renderResult.component,
            drawingSession,
            user,
        });

        vi.restoreAllMocks();
    },
});

describe("SessionScreen.svelte", () => {
    function expectToolbarTemporarilyShown(sessionScreen: SessionScreen) {
        expect(sessionScreen.toolbarIsShown()).toBe(true);
        vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
        expect(sessionScreen.toolbarIsShown()).toBe(false);
    }

    function expectToolbarPermanentlyShown(sessionScreen: SessionScreen) {
        expect(sessionScreen.toolbarIsShown()).toBe(true);
        vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
        expect(sessionScreen.toolbarIsShown()).toBe(true);
    }

    test("toolbar shows on hover and hides after delay", async ({
        fixture: { sessionScreen, user },
    }) => {
        expect(sessionScreen.toolbarIsShown()).toBe(false);
        await user.hover(document.body);
        expectToolbarTemporarilyShown(sessionScreen);
    });

    test.for([
        {
            name: "toolbar",
            region: () => screen.getAllByRole("toolbar")[0],
        },
        {
            name: "drawings completed",
            region: () => screen.getByText(/drawings completed/i),
        },
    ])(
        "toolbar does not hide if mouse is still over $name",
        async ({ region }, { fixture: { sessionScreen, user } }) => {
            expect(sessionScreen.toolbarIsShown()).toBe(false);
            await user.hover(region());
            expectToolbarPermanentlyShown(sessionScreen);
            await user.unhover(document.body);
            expectToolbarTemporarilyShown(sessionScreen);
        },
    );

    test("freeze and unfreeze", async ({ fixture: { sessionScreen, drawingSession } }) => {
        drawingSession.resume();

        // Freeze
        expect(sessionScreen.toolbarIsShown()).toBe(false);
        sessionScreen.freeze();
        expect(drawingSession.isPaused).toBe(true);
        const exitButton = screen.getByRole("button", { name: "Exit session" });
        await waitFor(() => expect(exitButton).toBeDisabled());
        expectToolbarPermanentlyShown(sessionScreen);

        // Unfreeze
        sessionScreen.unfreeze();
        expect(drawingSession.isPaused).toBe(false);
        await waitFor(() => expect(exitButton).toBeEnabled());
        expectToolbarTemporarilyShown(sessionScreen);
    });

    test("unfreeze does not resume a manually paused session", async ({
        fixture: { sessionScreen, drawingSession },
    }) => {
        drawingSession.resume();
        drawingSession.pause();

        sessionScreen.freeze();
        sessionScreen.unfreeze();

        expect(drawingSession.isPaused).toBe(true);
    });

    test("resume and pause", async ({ fixture: { sessionScreen, drawingSession, user } }) => {
        expect(drawingSession.isPaused).toBe(true);

        // Resume
        await user.click(screen.getByRole("button", { name: /resume/i }));
        await user.unhover(document.body);
        expect(drawingSession.isPaused).toBe(false);
        expect(screen.queryByText(/paused/i)).toBeNull();
        expectToolbarTemporarilyShown(sessionScreen);

        // Pause
        await user.click(screen.getByRole("button", { name: /pause/i }));
        await user.unhover(document.body);
        expect(drawingSession.isPaused).toBe(true);
        expect(screen.getByText(/paused/i)).toBeVisible();
        expectToolbarTemporarilyShown(sessionScreen);
    });

    test("hotkeys with modifier keys held do not trigger tools", async ({
        fixture: { drawingSession, user },
    }) => {
        await user.keyboard("{ArrowRight}");
        expect(drawingSession.curRepeatIdx).toBe(1);
        await user.keyboard("{Meta>}{ArrowRight}{/Meta}");
        expect(drawingSession.curRepeatIdx).toBe(1);
        await user.keyboard("{Control>}{ArrowRight}{/Control}");
        expect(drawingSession.curRepeatIdx).toBe(1);
        await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
        expect(drawingSession.curRepeatIdx).toBe(1);
    });
});
