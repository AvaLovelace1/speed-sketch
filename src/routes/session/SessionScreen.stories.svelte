<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { DrawingSession } from "$lib/drawing-session.svelte.js";
    import SessionScreen from "./SessionScreen.svelte";
    import type { Props as SessionScreenProps } from "./SessionScreen.svelte";
    import Sample1 from "$lib/assets/images/pexels-by-hong-son.jpg";
    import Sample2 from "$lib/assets/images/pexels-by-sasha-kim.jpg";
    import Sample3 from "$lib/assets/images/pexels-by-andrew-sindt.jpg";
    import { Tooltip } from "bits-ui";
    import { fn, expect, clearAllMocks, screen, within, waitFor } from "storybook/test";

    const imgs = [
        { name: "img1.jpg", url: Sample1 },
        { name: "img2.jpg", url: Sample2 },
        { name: "img3.jpg", url: Sample3 },
    ];

    const { Story } = defineMeta({
        title: "Screens/SessionScreen",
        component: SessionScreen,
        tags: ["autodocs"],
        render: template,
        args: {
            drawingSession: new DrawingSession(imgs, [{ duration: 60, repeat: Infinity }]),
            exit: fn(),
            setAlwaysOnTop: fn(),
            showImageFolder: fn(),
            hideToolbarTimeoutDuration: 5000,
        },
    });

    let sessionScreen: SessionScreen;
</script>

{#snippet template(args: SessionScreenProps)}
    <Tooltip.Provider>
        <SessionScreen bind:this={sessionScreen} {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- The main UI for the drawing session. -->
<Story name="Default" />

<!-- With a custom schedule, the total number of images is displayed in the top left. -->
<Story
    name="Class"
    args={{
        drawingSession: new DrawingSession(imgs, [
            { duration: 60, repeat: 42 },
            { duration: 120, repeat: 13 },
        ]),
    }}
/>

<!-- With user interactions. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        await step("Freeze and unfreeze", async () => {
            // Freeze
            expect(sessionScreen.toolbarIsShown()).toBe(false);
            sessionScreen.freeze();
            expect(args.drawingSession.isPaused).toBe(true);
            const exitBtn = screen.getByRole("button", { name: "Exit session" });
            await waitFor(() => expect(exitBtn).toBeDisabled());

            // Unfreeze
            sessionScreen.unfreeze();
            expect(args.drawingSession.isPaused).toBe(false);
            await waitFor(() => expect(exitBtn).toBeEnabled());
        });

        await userEvent.click(canvas.getByRole("button", { name: /pause/i }));

        await step("Click resume and pause buttons", async () => {
            expect(args.drawingSession.isPaused).toBe(true);

            // Resume
            await userEvent.click(canvas.getByRole("button", { name: /resume/i }));
            expect(args.drawingSession.isPaused).toBe(false);
            await expect(canvas.queryByText(/paused/i)).toBeNull();

            // Pause
            await userEvent.click(canvas.getByRole("button", { name: /pause/i }));
            expect(args.drawingSession.isPaused).toBe(true);
            await waitFor(() => expect(canvas.getByText(/paused/i)).toBeVisible());
        });

        await step("Click previous and next buttons", async () => {
            expect(args.drawingSession.curImgIdx).toBe(0);
            await userEvent.click(canvas.getByRole("button", { name: /next/i }));
            expect(args.drawingSession.curImgIdx).toBe(1);
            await userEvent.click(canvas.getByRole("button", { name: /previous/i }));
            expect(args.drawingSession.curImgIdx).toBe(0);
        });

        await step("Click zoom buttons", async () => {
            expect(sessionScreen.getImgTransform().scale).toBe(1);

            // Zoom in
            const zoomInBtn = canvas.getByRole("button", { name: /zoom in/i });
            await userEvent.click(zoomInBtn);
            await expect(sessionScreen.getImgTransform().scale).toBeGreaterThan(1);

            // Zoom out
            const zoomOutBtn = canvas.getByRole("button", { name: /zoom out/i });
            await userEvent.click(zoomOutBtn);
            await userEvent.click(zoomOutBtn);
            await expect(sessionScreen.getImgTransform().scale).toBeLessThan(1);

            // Reset zoom
            const resetZoomButton = canvas.getByRole("button", { name: /reset zoom/i });
            await userEvent.click(resetZoomButton);
            expect(sessionScreen.getImgTransform().scale).toBe(1);
        });

        await step("Click image manipulation buttons", async () => {
            for (const { button, className } of [
                {
                    button: () => canvas.getByRole("button", { name: /flip horizontal/i }),
                    className: "-scale-x-100",
                },
                {
                    button: () => canvas.getByRole("button", { name: /flip vertical/i }),
                    className: "-scale-y-100",
                },
                {
                    button: () => canvas.getByRole("button", { name: /greyscale/i }),
                    className: "grayscale",
                },
                {
                    button: () => canvas.getByRole("button", { name: /contrast/i }),
                    className: /contrast/,
                },
                {
                    button: () => canvas.getByRole("button", { name: /blur/i }),
                    className: /blur/,
                },
            ]) {
                const btn = button();
                await userEvent.click(btn);
                await expect(canvas.getByRole("img")).toHaveClass(className);
                await userEvent.click(btn);
                await expect(canvas.getByRole("img")).not.toHaveClass(className);
            }
        });

        await step("Click grid button", async () => {
            const gridBtn = canvas.getByRole("button", { name: /grid/i });
            await userEvent.click(gridBtn);
            await waitFor(() =>
                expect(canvas.getByRole("presentation", { name: /grid/i })).toBeVisible(),
            );
            await userEvent.click(gridBtn);
            await expect(canvas.queryByRole("presentation", { name: /grid/i })).toBeNull();
        });

        await step("Click hide timer button", async () => {
            const hideTimerBtn = canvas.getByRole("button", { name: /hide timer/i });
            await userEvent.click(hideTimerBtn);
            await expect(canvas.queryByText(/time remaining/i)).toBeNull();
            await userEvent.click(hideTimerBtn);
            await waitFor(() => expect(canvas.getByText(/time remaining/i)).toBeVisible());
        });

        await step("Click pin window button", async () => {
            const pinBtn = canvas.getByRole("button", { name: /pin window/i });

            // Pin
            await userEvent.click(pinBtn);
            await expect(args.setAlwaysOnTop).toHaveBeenCalledTimes(1);
            await expect(args.setAlwaysOnTop).toHaveBeenLastCalledWith(true);

            // Unpin
            await userEvent.click(pinBtn);
            await expect(args.setAlwaysOnTop).toHaveBeenCalledTimes(2);
            await expect(args.setAlwaysOnTop).toHaveBeenLastCalledWith(false);

            clearAllMocks();
        });

        await step("Click show image folder button", async () => {
            const showFolderBtn = canvas.getByRole("button", { name: /show image folder/i });
            await userEvent.click(showFolderBtn);
            await expect(args.showImageFolder).toHaveBeenCalledTimes(1);
            clearAllMocks();
        });

        await step("Click exit session button", async () => {
            const exitBtn = canvas.getByRole("button", { name: /exit session/i });
            await userEvent.click(exitBtn);
            const dialogCanvas = within(screen.getByRole("alertdialog"));
            await userEvent.click(await dialogCanvas.findByRole("button", { name: "Exit" }));
            await expect(args.exit).toHaveBeenCalledTimes(1);
            clearAllMocks();

            // Close the dialog. Session should be unfrozen
            await userEvent.click(await dialogCanvas.findByRole("button", { name: /close/i }));
            await waitFor(() => expect(exitBtn).toBeEnabled());
        });
    }}
/>
