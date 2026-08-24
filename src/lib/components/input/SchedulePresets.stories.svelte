<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import SchedulePresets from "$lib/components/input/SchedulePresets.svelte";
    import type { Props as schedulePresetsProps } from "$lib/components/input/SchedulePresets.svelte";
    import { Tooltip } from "bits-ui";
    import {
        fn,
        expect,
        screen,
        clearAllMocks,
        waitFor,
        waitForElementToBeRemoved,
    } from "storybook/test";

    const { Story } = defineMeta({
        title: "Components/Input/SchedulePresets",
        component: SchedulePresets,
        tags: ["autodocs"],
        render: template,
        args: {
            schedulePresets: [
                {
                    name: "Default Preset",
                    schedule: [{ duration: 60, repeat: 20, id: "d1" }],
                },
                {
                    name: "Quick Warmup",
                    schedule: [{ duration: 30, repeat: 20, id: "w1" }],
                },
                {
                    name: "Full Session",
                    schedule: [
                        { duration: 60, repeat: 10, id: "f1" },
                        { duration: 30, repeat: 1, id: "f2", isBreak: true },
                        { duration: 120, repeat: 5, id: "f3" },
                    ],
                },
            ],
            selectedIdx: 0,
            onSelect: fn(),
            onAdd: fn(),
            onRename: fn(),
            onDelete: fn(),
        },
    });
</script>

{#snippet template(args: schedulePresetsProps)}
    <Tooltip.Provider>
        <SchedulePresets {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- Schedule presets selector with pre-existing schedule presets. -->
<Story name="Default" />

<!-- With no presets, the dropdown, delete, and rename buttons are disabled. -->
<Story
    name="No Presets"
    args={{ schedulePresets: [], selectedIdx: -1 }}
    play={async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: /schedule presets/i })).toBeDisabled();
        await expect(canvas.getByRole("button", { name: /add preset/i })).toBeEnabled();
        for (const btnName of [/rename preset/i, /delete preset/i]) {
            await expect(canvas.getByRole("button", { name: btnName })).toBeDisabled();
        }
    }}
/>

<!-- Supports preset select, add, rename, and delete callbacks. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        const addBtn = canvas.getByRole("button", { name: /add/i });
        const renameBtn = canvas.getByRole("button", { name: /rename/i });
        const deleteBtn = canvas.getByRole("button", { name: /delete/i });

        await step("Choose a different schedule from the dropdown", async () => {
            const trigger = await canvas.findByRole("button", { name: /schedule presets/i });
            await userEvent.click(trigger);
            const option = await screen.findByRole("option", { name: /quick warmup/i });
            await userEvent.click(option);
            await expect(args.onSelect).toHaveBeenCalledOnce();
            clearAllMocks();
        });

        await step("Add button opens a name input dialog", async () => {
            await userEvent.click(addBtn);
            const nameInput = await screen.findByLabelText(/enter a name/i);

            // Focus starts in the text box so the user can just type
            await waitFor(() => expect(nameInput).toHaveFocus());

            const submitBtn = screen.getByRole("button", { name: /^add$/i });
            await expect(submitBtn).toBeDisabled();

            await userEvent.type(nameInput, "New Schedule");
            await expect(submitBtn).toBeEnabled();

            await userEvent.click(submitBtn);

            await expect(args.onAdd).toHaveBeenCalledWith("New Schedule");
            clearAllMocks();

            await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
        });

        await step("Rename button opens a name input dialog", async () => {
            await userEvent.click(renameBtn);
            const nameInput = await screen.findByLabelText(/enter a new name/i);

            // Pre-filled with current preset name, and ready to edit
            await expect(nameInput).toHaveValue("Default Preset");
            await waitFor(() => expect(nameInput).toHaveFocus());

            const submitBtn = screen.getByRole("button", { name: /^rename$/i });

            // Clear and leave empty; submit should be disabled
            await userEvent.clear(nameInput);
            await expect(submitBtn).toBeDisabled();

            await userEvent.type(nameInput, "Renamed Preset");
            await expect(submitBtn).toBeEnabled();

            await userEvent.click(submitBtn);

            await expect(args.onRename).toHaveBeenCalledWith("Renamed Preset");
            clearAllMocks();

            await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
        });

        await step("Delete button shows confirmation dialog", async () => {
            await userEvent.click(deleteBtn);

            const confirmBtn = screen.getByRole("button", { name: /^delete$/i });
            await userEvent.click(confirmBtn);
            await expect(args.onDelete).toHaveBeenCalledOnce();
            clearAllMocks();

            await waitForElementToBeRemoved(() => screen.queryByRole("alertdialog"));
        });
    }}
/>
