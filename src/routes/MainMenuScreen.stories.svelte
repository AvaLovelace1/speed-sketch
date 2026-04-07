<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuScreen from "./MainMenuScreen.svelte";
    import type { Props as MainMenuScreenProps } from "./MainMenuScreen.svelte";
    import { Tooltip } from "bits-ui";
    import { SessionSettings } from "$lib/store/session-settings.svelte";
    import Sample1 from "$lib/assets/images/pexels-by-hong-son.jpg";
    import Sample2 from "$lib/assets/images/pexels-by-sasha-kim.jpg";
    import Sample3 from "$lib/assets/images/pexels-by-andrew-sindt.jpg";
    import { fn, expect, clearAllMocks, screen, within, waitFor } from "storybook/test";

    const img1 = { name: "img1.jpg", url: Sample1 };
    const img2 = { name: "img2.jpg", url: Sample2 };
    const img3 = { name: "img3.jpg", url: Sample3 };

    const { Story } = defineMeta({
        title: "Screens/MainMenuScreen",
        component: MainMenuScreen,
        tags: ["autodocs"],
        render: template,
        args: {
            sessionSettings: new SessionSettings(),
            onImgsInput: fn(),
            startSession: fn(),
        },
    });
</script>

{#snippet template(args: MainMenuScreenProps)}
    <Tooltip.Provider>
        <MainMenuScreen {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- The user sees this on first startup. -->
<Story name="Default" />

<!-- Scheduler input is displayed when using Class session mode. -->
<Story
    name="Class"
    args={{
        sessionSettings: new SessionSettings({
            schedulePresets: [
                {
                    name: "Default Preset",
                    schedule: [
                        { duration: 60, repeat: 20, id: "1" },
                        { duration: 145, repeat: 10, id: "2" },
                        { duration: 3611, repeat: 5, id: "3" },
                    ],
                },
            ],
            sessionMode: "Class",
        }),
    }}
/>

<!-- Loading images. -->
<Story name="Loading Images" args={{ isLoadingImgs: true, canStartSession: false }} />

<!-- More images loaded than can fit in the thumbnail grid. -->
<Story
    name="Many Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2, img3, img1, img2, img3],
        canStartSession: true,
    }}
/>

<!-- Enough images loaded to exactly fill the thumbnail grid. -->
<Story
    name="Some Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
    }}
/>

<!-- One image loaded. -->
<Story name="One Image" args={{ imgs: [img1], canStartSession: true }} />

<!-- Invalid image folder chosen. -->
<Story name="Invalid" args={{ imgErrMsg: "No images found", canStartSession: false }} />

<!-- The Tauri UI shows the shows the "include subfolders" checkbox, shows the folder name, and hides the "no upload" message. -->
<Story
    name="Tauri"
    args={{
        sessionSettings: new SessionSettings({
            imgFolder: "C:\\Users\\User\\Pictures",
        }),
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
        isTauri: true,
    }}
/>

<!-- The folder name is red when invalid. -->
<Story
    name="Tauri Invalid"
    args={{
        sessionSettings: new SessionSettings({
            imgFolder: "C:\\Users\\User\\Pictures",
        }),
        imgErrMsg: "No images found",
        canStartSession: false,
        isTauri: true,
    }}
/>

<Story
    name="With Interactions"
    args={{ canStartSession: true }}
    play={async ({ args, canvas, userEvent, step }) => {
        await step("Toggle shuffle checkbox", async () => {
            const shuffleCheckbox = await canvas.findByRole("checkbox", { name: /shuffle/i });
            await userEvent.click(shuffleCheckbox);
            expect(args.sessionSettings.shuffleImgs).toBe(false);
            await userEvent.click(shuffleCheckbox);
            expect(args.sessionSettings.shuffleImgs).toBe(true);
        });

        await step("Select time of 1m", async () => {
            await userEvent.click(canvas.getByRole("radio", { name: /1m/i }));
            await expect(
                canvas.queryByRole("spinbutton", { name: /minute, custom time/i }),
            ).toBeNull();
            expect(args.sessionSettings.imgShowTime).toBe(60);
        });

        await step("Select custom time", async () => {
            await userEvent.click(canvas.getByRole("radio", { name: /custom/i }));
            const hourInput = await canvas.findByRole("spinbutton", { name: /hour, custom time/i });
            const minuteInput = await canvas.findByRole("spinbutton", {
                name: /minute, custom time/i,
            });
            const secondInput = await canvas.findByRole("spinbutton", {
                name: /second, custom time/i,
            });
            await userEvent.type(hourInput, "2");
            await userEvent.type(minuteInput, "30");
            await userEvent.type(secondInput, "15");
            expect(args.sessionSettings.imgShowTime).toBe(2 * 3600 + 30 * 60 + 15);
        });

        await step("Start session", async () => {
            const startButton = await canvas.findByRole("button", { name: /go/i });
            await userEvent.click(startButton);
            await expect(args.startSession).toHaveBeenCalledOnce();
            clearAllMocks();
        });

        await step("Switch to Class mode", async () => {
            await userEvent.click(canvas.getByRole("radio", { name: /class/i }));
            expect(args.sessionSettings.sessionMode).toBe("Class");
        });

        const schedulePresetBtn = canvas.getByRole("button", { name: /schedule presets/i });
        const addPresetBtn = canvas.getByRole("button", { name: /add preset/i });
        const deleteBtn = canvas.getByRole("button", { name: /delete/i });
        const customName = "My Warmup";
        const addDrawingBtn = canvas.getByRole("button", { name: /add drawing/i });

        await step("Default Preset: delete button is disabled", async () => {
            await expect(deleteBtn).toBeDisabled();
        });

        await step("Add a new preset with a custom name", async () => {
            await userEvent.click(addPresetBtn);

            const nameInput = await screen.findByLabelText(/enter a name/i);
            await userEvent.type(nameInput, customName);

            const submitBtn = screen.getByRole("button", { name: /^add$/i });
            await userEvent.click(submitBtn);

            // New preset should be auto-selected
            expect(args.sessionSettings.selectedScheduleIdx).toBe(1);
            await waitFor(() => expect(schedulePresetBtn).toHaveTextContent(customName));
        });

        await step("New preset starts empty", async () => {
            expect(args.sessionSettings.sessionScheduleCustom).toEqual([]);
            // No schedule rows should be visible, just the empty prompt
            await expect(canvas.queryAllByRole("row")).toHaveLength(1); // empty prompt row
        });

        await step("Add a drawing interval to the new preset", async () => {
            await userEvent.click(addDrawingBtn);

            const rows = canvas.getAllByRole("row");
            await expect(rows).toHaveLength(1);
            const numImgsInput = within(rows[0]).getByRole("spinbutton", { name: /images/i });
            await expect(numImgsInput).toHaveValue(1);

            // Verify the entry was added to the underlying data
            await expect(args.sessionSettings.sessionScheduleCustom).toHaveLength(1);
        });

        await step("Switch back to Default Preset", async () => {
            await userEvent.click(schedulePresetBtn);
            const option = await screen.findByRole("option", { name: /default preset/i });
            await userEvent.click(option);

            await waitFor(() => expect(args.sessionSettings.selectedScheduleIdx).toBe(0));
            // Default Preset has the default schedule entries
            await expect(args.sessionSettings.sessionScheduleCustom).toHaveLength(4);
        });

        await step("Switch back to custom preset and verify entry is preserved", async () => {
            await userEvent.click(schedulePresetBtn);
            const option = await screen.findByRole("option", { name: customName });
            await userEvent.click(option);

            await waitFor(() => expect(args.sessionSettings.selectedScheduleIdx).toBe(1));
            await expect(args.sessionSettings.sessionScheduleCustom).toHaveLength(1);
        });

        await step("Delete the custom preset with confirmation", async () => {
            await expect(deleteBtn).toBeEnabled();
            await userEvent.click(deleteBtn);

            // Confirmation dialog should appear
            const alertDialog = await screen.findByRole("alertdialog");
            await expect(alertDialog).toHaveTextContent(customName);

            const confirmBtn = screen.getByRole("button", { name: /^delete$/i });
            await userEvent.click(confirmBtn);

            // Should fall back to Default Preset
            await waitFor(() => expect(args.sessionSettings.schedulePresets).toHaveLength(1));
            expect(args.sessionSettings.selectedScheduleIdx).toBe(0);
            await waitFor(() => expect(schedulePresetBtn).toHaveTextContent(/default preset/i));
        });

        await step("Default Preset: delete button is still disabled after deletion", async () => {
            await expect(deleteBtn).toBeDisabled();
        });
    }}
/>
