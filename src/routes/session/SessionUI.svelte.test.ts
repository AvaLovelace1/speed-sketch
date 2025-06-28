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
    function expectToolbarTemporarilyShown(sessionUI: SessionUI) {
        expect(sessionUI.toolbarIsShown()).toBe(true);
        vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
        expect(sessionUI.toolbarIsShown()).toBe(false);
    }

    function expectToolbarPermanentlyShown(sessionUI: SessionUI) {
        expect(sessionUI.toolbarIsShown()).toBe(true);
        vi.advanceTimersByTime(HIDE_TOOLBAR_TIMEOUT);
        expect(sessionUI.toolbarIsShown()).toBe(true);
    }

    testSessionUI(
        "toolbar shows on hover and hides after delay",
        async ({ fixture: { sessionUI, user } }) => {
            expect(sessionUI.toolbarIsShown()).toBe(false);
            await user.hover(document.body);
            expectToolbarTemporarilyShown(sessionUI);
        },
    );

    testSessionUI(
        "toolbar does not hide if mouse is still over it",
        async ({ fixture: { sessionUI, user } }) => {
            expect(sessionUI.toolbarIsShown()).toBe(false);
            await user.hover(screen.getAllByRole("toolbar")[0]);
            expectToolbarPermanentlyShown(sessionUI);

            await user.unhover(document.body);
            expectToolbarTemporarilyShown(sessionUI);
        },
    );

    testSessionUI("freeze and unfreeze", async ({ fixture: { sessionUI, drawingSession } }) => {
        // Freeze
        expect(sessionUI.toolbarIsShown()).toBe(false);
        sessionUI.freeze();
        expect(drawingSession.isPaused).toBe(true);
        // Tools should be disabled - doesn't work in testing environment
        // expect(screen.getByRole("button", { name: "Exit session" })).toBeDisabled();
        expectToolbarPermanentlyShown(sessionUI);

        // Unfreeze
        sessionUI.unfreeze();
        expect(drawingSession.isPaused).toBe(false);
        expect(screen.getByRole("button", { name: "Exit session" })).toBeEnabled();
        expectToolbarTemporarilyShown(sessionUI);
    });

    testSessionUI("prev and next buttons", async ({ fixture: { drawingSession, user } }) => {
        expect(drawingSession.curImgIdx).toBe(0);
        await user.click(screen.getByRole("button", { name: /next/i }));
        expect(drawingSession.curImgIdx).toBe(1);
        await user.click(screen.getByRole("button", { name: /previous/i }));
        expect(drawingSession.curImgIdx).toBe(0);
    });

    testSessionUI("pause and resume", async ({ fixture: { sessionUI, drawingSession, user } }) => {
        expect(drawingSession.isPaused).toBe(true);
        await user.click(screen.getByRole("button", { name: /resume/i }));
        await user.unhover(document.body);
        expect(drawingSession.isPaused).toBe(false);
        expectToolbarTemporarilyShown(sessionUI);

        await user.click(screen.getByRole("button", { name: /pause/i }));
        await user.unhover(document.body);
        expect(drawingSession.isPaused).toBe(true);
        expectToolbarTemporarilyShown(sessionUI);
    });

    testSessionUI("image manipulation", async ({ fixture: { user } }) => {
        // Flip horizontal
        const flipHorizontalButton = screen.getByRole("button", { name: /flip horizontal/i });
        await user.click(flipHorizontalButton);
        expect(screen.getByRole("img")).toHaveClass("-scale-x-100");
        await user.click(flipHorizontalButton);
        expect(screen.getByRole("img")).not.toHaveClass("-scale-x-100");

        // Flip vertical
        const flipVerticalButton = screen.getByRole("button", { name: /flip vertical/i });
        await user.click(flipVerticalButton);
        expect(screen.getByRole("img")).toHaveClass("-scale-y-100");
        await user.click(flipVerticalButton);
        expect(screen.getByRole("img")).not.toHaveClass("-scale-y-100");

        // Greyscale
        const greyscaleButton = screen.getByRole("button", { name: /greyscale/i });
        await user.click(greyscaleButton);
        expect(screen.getByRole("img")).toHaveClass("grayscale");
        await user.click(greyscaleButton);
        expect(screen.getByRole("img")).not.toHaveClass("grayscale");

        // Contrast
        const contrastButton = screen.getByRole("button", { name: /contrast/i });
        await user.click(contrastButton);
        expect(screen.getByRole("img")).toHaveClass(/contrast/);
        await user.click(contrastButton);
        expect(screen.getByRole("img")).not.toHaveClass(/contrast/);

        // Blur
        const blurButton = screen.getByRole("button", { name: /blur/i });
        await user.click(blurButton);
        expect(screen.getByRole("img")).toHaveClass(/blur/);
        await user.click(blurButton);
        expect(screen.getByRole("img")).not.toHaveClass(/blur/);
    });
});
