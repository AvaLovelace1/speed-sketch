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
        exit: () => void;
        setAlwaysOnTop: (value: boolean) => Promise<void>;
        showImageFolder: () => Promise<void>;
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
        vi.mock("svelte/transition");
        vi.mock("svelte-reduced-motion/transition");
        vi.useFakeTimers();

        const imgs = [
            { name: "image1.jpg", url: "https://localhost/image1.jpg" },
            { name: "image2.jpg", url: "https://localhost/image2.jpg" },
            { name: "image3.jpg", url: "https://localhost/image3.jpg" },
        ];
        const imgShowTime = 60;
        const drawingSession = new DrawingSession(imgs, imgShowTime);
        const exit = vi.fn();
        const setAlwaysOnTop = vi.fn();
        const showImageFolder = vi.fn();

        const renderResult = render(SessionUI, {
            drawingSession,
            exit,
            setAlwaysOnTop,
            showImageFolder,
            includeTooltipProvider: true,
            hideToolbarTimeoutDuration: HIDE_TOOLBAR_TIMEOUT,
        });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        await use({
            sessionUI: renderResult.component,
            drawingSession,
            user,
            exit,
            setAlwaysOnTop,
            showImageFolder,
        });

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

    testSessionUI.for([
        {
            name: "toolbar",
            region: () => screen.getAllByRole("toolbar")[0],
        },
        {
            name: "images completed",
            region: () => screen.getByText(/images completed/i),
        },
    ])(
        "toolbar does not hide if mouse is still over $name",
        async ({ region }, { fixture: { sessionUI, user } }) => {
            expect(sessionUI.toolbarIsShown()).toBe(false);
            await user.hover(region());
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

    testSessionUI("resume and pause", async ({ fixture: { sessionUI, drawingSession, user } }) => {
        expect(drawingSession.isPaused).toBe(true);

        // Resume
        await user.click(screen.getByRole("button", { name: /resume/i }));
        await user.unhover(document.body);
        expect(drawingSession.isPaused).toBe(false);
        expect(screen.queryByText(/paused/i)).toBeNull();
        expectToolbarTemporarilyShown(sessionUI);

        // Pause
        await user.click(screen.getByRole("button", { name: /pause/i }));
        await user.unhover(document.body);
        expect(drawingSession.isPaused).toBe(true);
        expect(screen.getByText(/paused/i)).toBeVisible();
        expectToolbarTemporarilyShown(sessionUI);
    });

    testSessionUI("zoom", async ({ fixture: { sessionUI, user } }) => {
        expect(sessionUI.getImgTransform().scale).toBe(1);

        // Zoom in
        const zoomInButton = screen.getByRole("button", { name: /zoom in/i });
        await user.click(zoomInButton);
        expect(sessionUI.getImgTransform().scale).toBeGreaterThan(1);

        // Zoom out
        const zoomOutButton = screen.getByRole("button", { name: /zoom out/i });
        await user.click(zoomOutButton);
        await user.click(zoomOutButton);
        expect(sessionUI.getImgTransform().scale).toBeLessThan(1);

        // Reset zoom
        const resetZoomButton = screen.getByRole("button", { name: /reset zoom/i });
        await user.click(resetZoomButton);
        expect(sessionUI.getImgTransform().scale).toBe(1);
    });

    testSessionUI.for([
        {
            name: "flip horizontal",
            button: () => screen.getByRole("button", { name: /flip horizontal/i }),
            className: "-scale-x-100",
        },
        {
            name: "flip vertical",
            button: () => screen.getByRole("button", { name: /flip vertical/i }),
            className: "-scale-y-100",
        },
        {
            name: "greyscale",
            button: () => screen.getByRole("button", { name: /greyscale/i }),
            className: "grayscale",
        },
        {
            name: "contrast",
            button: () => screen.getByRole("button", { name: /contrast/i }),
            className: /contrast/,
        },
        {
            name: "blur",
            button: () => screen.getByRole("button", { name: /blur/i }),
            className: /blur/,
        },
    ])("image manipulation: $name", async ({ button, className }, { fixture: { user } }) => {
        const btn = button();
        await user.click(btn);
        expect(screen.getByRole("img")).toHaveClass(className);
        await user.click(btn);
        expect(screen.getByRole("img")).not.toHaveClass(className);
    });

    testSessionUI("hide timer button", async ({ fixture: { user } }) => {
        const hideTimerButton = screen.getByRole("button", { name: /hide timer/i });
        await user.click(hideTimerButton);
        expect(screen.queryByText(/time remaining/i)).toBeNull();
        await user.click(hideTimerButton);
        expect(screen.getByText(/time remaining/i)).toBeVisible();
    });

    testSessionUI("pin window button", async ({ fixture: { user, setAlwaysOnTop } }) => {
        const pinButton = screen.getByRole("button", { name: /pin window/i });
        await user.click(pinButton);
        expect(setAlwaysOnTop).toHaveBeenCalledTimes(1);
        expect(setAlwaysOnTop).toHaveBeenLastCalledWith(true);

        await user.click(pinButton);
        expect(setAlwaysOnTop).toHaveBeenCalledTimes(2);
        expect(setAlwaysOnTop).toHaveBeenLastCalledWith(false);
    });

    testSessionUI("show image folder button", async ({ fixture: { user, showImageFolder } }) => {
        const showFolderButton = screen.getByRole("button", { name: /show image folder/i });
        await user.click(showFolderButton);
        expect(showImageFolder).toHaveBeenCalledTimes(1);
    });

    testSessionUI("exit session button", async ({ fixture: { user, exit } }) => {
        const exitButton = screen.getByRole("button", { name: /exit session/i });
        await user.click(exitButton);
        const confirmExitButton = screen.getByRole("button", { name: /yes/i });
        await user.click(confirmExitButton);
        expect(exit).toHaveBeenCalledTimes(1);
    });
});
