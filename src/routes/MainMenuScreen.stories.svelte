<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuScreen from "./MainMenuScreen.svelte";
    import type { Props as MainMenuScreenProps } from "./MainMenuScreen.svelte";
    import { Tooltip } from "bits-ui";
    import { SessionSettings } from "$lib/store/session-settings.svelte";
    import Sample1 from "$lib/assets/images/pexels-by-hong-son.jpg";
    import Sample2 from "$lib/assets/images/pexels-by-israel-torres.mp4";
    import Sample3 from "$lib/assets/images/pexels-by-andrew-sindt.jpg";
    import {
        fn,
        expect,
        clearAllMocks,
        screen,
        within,
        waitFor,
        waitForElementToBeRemoved,
    } from "storybook/test";

    const img1 = { name: "img1.jpg", url: Sample1 };
    const img2 = { name: "img2.mp4", url: Sample2, isVideo: true };
    const img3 = { name: "img3.jpg", url: Sample3 };

    const { Story } = defineMeta({
        title: "Screens/MainMenuScreen",
        component: MainMenuScreen,
        tags: ["autodocs"],
        render: template,
        args: { onImgsInput: fn(), startSession: fn() },
    });
</script>

{#snippet template(args: MainMenuScreenProps)}
    <Tooltip.Provider>
        <MainMenuScreen {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- The user sees this on first startup. -->
<Story
    name="Default"
    play={async ({ canvas, step }) => {
        await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();

        await step("Footer has expected items", async () => {
            const footer = canvas.getByRole("contentinfo");
            for (const linkName of [/about/i, /bug/i, /feature/i]) {
                await expect(within(footer).getByRole("link", { name: linkName })).toBeVisible();
            }
            console.log(footer.textContent);
            await expect(footer.textContent).toMatch(/© \d\d\d\d/i);
            await expect(footer.textContent).toMatch(/v\d+\.\d+\.\d+/i);
        });

        await step("Buttons are enabled", async () => {
            for (const btnName of [/choose folder/i, /settings/i, /stats/i]) {
                await expect(canvas.getByRole("button", { name: btnName })).toBeEnabled();
            }
        });

        await step("Default session options are selected", async () => {
            await expect(canvas.getByRole("checkbox", { name: /shuffle/i })).toBeChecked();
            await expect(canvas.getByRole("radio", { name: /endless/i })).toBeChecked();
            await expect(canvas.getByRole("radio", { name: /30s/i })).toBeChecked();
        });
    }}
/>

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
                        { duration: 120, repeat: 1, id: "break", isBreak: true },
                        { duration: 3611, repeat: 5, id: "2" },
                    ],
                },
            ],
            sessionMode: "Class",
        }),
    }}
    play={async ({ canvas }) => {
        await expect(canvas.getByRole("radio", { name: /class/i })).toBeChecked();
        await expect(canvas.getByText(/total drawings/i)).toBeVisible();
        await expect(canvas.getByText(/total duration/i)).toBeVisible();
    }}
/>

<!-- A message is displayed when there are no presets, and the dropdown is disabled. -->
<Story
    name="No Presets"
    args={{
        sessionSettings: new SessionSettings({
            schedulePresets: [],
            selectedScheduleIdx: -1,
            sessionMode: "Class",
        }),
    }}
    play={async ({ canvas }) => {
        for (const btnName of [
            /add drawing interval/i,
            /add break/i,
            /remove entry/i,
            /move entry up/i,
            /move entry down/i,
        ]) {
            await expect(canvas.getByRole("button", { name: btnName })).toBeDisabled();
        }
    }}
/>

<!-- Loading images. -->
<Story
    name="Loading Images"
    args={{ isLoadingImgs: true, canStartSession: false }}
    play={async ({ canvas }) => {
        const spinners = canvas.getAllByRole("progressbar", { name: /loading/i });
        await expect(spinners.length).toBeGreaterThan(1);
        for (const spinner of spinners) await expect(spinner).toBeVisible();
    }}
/>

<!-- More images loaded than can fit in the thumbnail grid. -->
<Story
    name="Many Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2, img3, img1, img2, img3],
        canStartSession: true,
    }}
    play={async ({ canvas }) => {
        const imgs = canvas.getAllByRole("img", { name: /thumbnail/i });
        await expect(imgs.length).toBeGreaterThan(1);
        for (const img of imgs) await expect(img).toBeVisible();
    }}
/>

<!-- Enough images loaded to exactly fill the thumbnail grid. -->
<Story
    name="Some Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
    }}
    play={async ({ canvas }) => {
        const imgs = canvas.getAllByRole("img", { name: /thumbnail/i });
        await expect(imgs).toHaveLength(8 - 3); // not including video thumbnails
        for (const img of imgs) await expect(img).toBeVisible();
    }}
/>

<!-- One image loaded. -->
<Story
    name="One Image"
    args={{ imgs: [img1], canStartSession: true }}
    play={async ({ canvas }) => {
        const imgs = canvas.getAllByRole("img", { name: /thumbnail/i });
        await expect(imgs).toHaveLength(1);
        for (const img of imgs) await expect(img).toBeVisible();
    }}
/>

<!-- Invalid reference folder chosen. -->
<Story
    name="Invalid"
    args={{ imgErrMsg: "No references found", canStartSession: false }}
    play={async ({ args, canvas }) => {
        const status = canvas.getByRole("status");
        await expect(status).toBeVisible();
        await expect(status.textContent).toContain(args.imgErrMsg);
    }}
/>

<Story
    name="With Interactions"
    args={{ sessionSettings: new SessionSettings(), canStartSession: true }}
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
        const renameBtn = canvas.getByRole("button", { name: /rename/i });
        const deleteBtn = canvas.getByRole("button", { name: /delete/i });
        const customName = "My Warmup";
        const newName = "New Name";
        const addDrawingBtn = canvas.getByRole("button", { name: /add drawing/i });

        await step("Add a new preset with a custom name", async () => {
            await userEvent.click(addPresetBtn);

            const nameInput = await screen.findByLabelText(/enter a name/i);
            await userEvent.type(nameInput, customName);

            const submitBtn = screen.getByRole("button", { name: /^add$/i });
            await userEvent.click(submitBtn);
            await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));

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
            const numImgsInput = within(rows[0]).getByRole("spinbutton", { name: /drawings/i });
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

        await step("Rename the custom preset", async () => {
            await expect(renameBtn).toBeEnabled();
            await userEvent.click(renameBtn);

            // Confirmation dialog should appear
            const dialog = await screen.findByRole("dialog");
            await expect(dialog).toHaveTextContent(/rename preset/i);

            const nameInput = await screen.findByLabelText(/enter a new name/i);
            await userEvent.clear(nameInput);
            await userEvent.type(nameInput, newName);

            const confirmBtn = screen.getByRole("button", { name: /^rename$/i });
            await userEvent.click(confirmBtn);
            await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));

            await waitFor(() => expect(args.sessionSettings.schedulePresets[1].name).toBe(newName));
            await waitFor(() => expect(schedulePresetBtn).toHaveTextContent(newName));
        });

        await step("Delete the custom preset with confirmation", async () => {
            await expect(deleteBtn).toBeEnabled();
            await userEvent.click(deleteBtn);

            // Confirmation dialog should appear
            const alertDialog = await screen.findByRole("alertdialog");
            await expect(alertDialog).toHaveTextContent(/delete preset/i);
            await expect(alertDialog).toHaveTextContent(newName);

            const confirmBtn = screen.getByRole("button", { name: /^delete$/i });
            await userEvent.click(confirmBtn);
            await waitForElementToBeRemoved(() => screen.queryByRole("alertdialog"));

            // Should fall back to Default Preset
            await waitFor(() => expect(args.sessionSettings.schedulePresets).toHaveLength(1));
            expect(args.sessionSettings.selectedScheduleIdx).toBe(0);
            await waitFor(() => expect(schedulePresetBtn).toHaveTextContent("Default Preset"));
        });
    }}
/>

<!-- The Tauri default UI has the "include subfolders" checkbox checked and displays a table with the selected folders. -->
<Story
    name="Tauri"
    args={{
        sessionSettings: new SessionSettings({ imgFolders: ["C:\\Users\\User\\Pictures"] }),
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
        isTauri: true,
    }}
    play={async ({ canvas }) => {
        const subfoldersCheckbox = await canvas.findByRole("checkbox", { name: /subfolders/i });
        await expect(subfoldersCheckbox).toBeChecked();

        const table = canvas.getByRole("table", { name: /reference folders/i });
        await expect(table).toBeVisible();
        await expect(within(table).getByRole("row", { name: /Pictures/i })).toBeVisible();

        const imgs = canvas.getAllByRole("img", { name: /thumbnail/i });
        await expect(imgs.length).toBeGreaterThan(1);
        for (const img of imgs) await expect(img).toBeVisible();
    }}
/>

<!-- Global invalid message. -->
<Story
    name="Tauri Invalid"
    args={{
        sessionSettings: new SessionSettings({ imgFolders: ["C:\\Users\\User\\Pictures"] }),
        imgErrMsg: "No references found",
        canStartSession: false,
        isTauri: true,
    }}
    play={async ({ args, canvas }) => {
        const status = canvas.getByRole("status");
        await expect(status).toBeVisible();
        await expect(status.textContent).toContain(args.imgErrMsg);
    }}
/>

<!-- One folder is flagged as invalid, and the references from the others still load. -->
<Story
    name="Tauri Invalid Folder"
    args={{
        sessionSettings: new SessionSettings({
            imgFolders: ["C:\\Users\\User\\Pictures", "E:\\External\\Unreachable"],
        }),
        imgs: [img1, img2, img3],
        folderErrs: { "E:\\External\\Unreachable": "Cannot access folder" },
        canStartSession: true,
        isTauri: true,
    }}
    play={async ({ canvas }) => {
        const table = canvas.getByRole("table", { name: /reference folders/i });
        const workingRow = within(table).getByRole("row", { name: /Pictures/i });
        const failedRow = within(table).getByRole("row", { name: /Unreachable/i });
        await expect(workingRow).not.toHaveTextContent(/cannot access folder/i);
        await expect(failedRow).toHaveTextContent(/cannot access folder/i);
    }}
/>

<Story
    name="Tauri With Interactions"
    args={{
        sessionSettings: new SessionSettings({ imgFolders: ["C:\\Users\\User\\Pictures"] }),
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
        isTauri: true,
    }}
    play={async ({ args, canvas, userEvent, step }) => {
        await step("Toggle subfolders checkbox", async () => {
            const subfoldersCheckbox = await canvas.findByRole("checkbox", { name: /subfolders/i });
            await userEvent.click(subfoldersCheckbox);
            expect(args.sessionSettings.includeSubfolders).toBe(false);
            await userEvent.click(subfoldersCheckbox);
            expect(args.sessionSettings.includeSubfolders).toBe(true);
        });

        await step("Refresh references", async () => {
            clearAllMocks();
            await userEvent.click(canvas.getByRole("button", { name: /refresh/i }));
            await expect(args.onImgsInput).toHaveBeenCalledWith(null);
        });
    }}
/>
