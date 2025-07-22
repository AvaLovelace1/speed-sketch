<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import SettingsDialog from "./SettingsDialog.svelte";
    import type { Props as SettingsDialogProps } from "./SettingsDialog.svelte";
    import { AppSettings } from "$lib/store/app-settings.svelte";
    import {
        clearAllMocks,
        expect,
        fn,
        spyOn,
        screen,
        waitFor,
        waitForElementToBeRemoved,
        within,
    } from "storybook/test";

    const { Story } = defineMeta({
        title: "Components/Dialog/SettingsDialog",
        component: SettingsDialog,
        tags: ["autodocs"],
        render: template,
        args: {
            appSettings: new AppSettings(),
            onOpen: fn(),
            onClose: fn(),
        },
    });

    let settingsDialog: SettingsDialog;
</script>

{#snippet template(args: SettingsDialogProps)}
    <button class="btn" onclick={() => settingsDialog.open()}>Open SettingsDialog</button>
    <SettingsDialog bind:this={settingsDialog} {...args} />
{/snippet}

<!-- User settings dialog. -->
<Story name="Default" />

<!-- Settings are saved to store when the dialog closes. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        const saveToStoreSpy = spyOn(args.appSettings, "saveToStore");

        async function openDialog() {
            await step("Open dialog", async () => {
                await userEvent.click(canvas.getByRole("button", { name: /open/i }));
                await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
                await waitFor(() => expect(args.onOpen).toHaveBeenCalledOnce());
                clearAllMocks();
            });
        }

        async function closeDialog() {
            await step("Close dialog", async () => {
                const dialogCanvas = within(screen.getByRole("dialog"));
                await userEvent.click(dialogCanvas.getByRole("button", { name: /close/i }));
                await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
                await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
                await waitFor(() => expect(saveToStoreSpy).toHaveBeenCalledOnce());
                clearAllMocks();
            });
        }

        await step("Open and close dialog", async () => {
            await openDialog();
            await closeDialog();
        });
    }}
/>
