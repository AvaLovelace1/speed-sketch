<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import AlertDialog from "$lib/components/dialog/AlertDialog.svelte";
    import type { Props as AlertDialogProps } from "$lib/components/dialog/AlertDialog.svelte";
    import {
        fn,
        within,
        screen,
        expect,
        waitFor,
        waitForElementToBeRemoved,
        clearAllMocks,
    } from "storybook/test";

    const { Story } = defineMeta({
        title: "Components/AlertDialog",
        component: AlertDialog,
        tags: ["autodocs"],
        args: {
            title: "Alert dialog",
            description: "A short description for the alert dialog",
            cancelText: "Cancel",
            confirmText: "Confirm",
            onOpen: fn(),
            onCancel: fn(),
            onConfirm: fn(),
        },
        parameters: {
            a11y: {
                config: {
                    rules: [
                        {
                            id: "color-contrast",
                            enabled: false, // Transitions interfere with color contrast checks
                        },
                    ],
                },
            },
        },
    });

    let alertDialog: AlertDialog;

    // Workaround for bug https://youtrack.jetbrains.com/issue/WEB-61819/Svelte-5-TypeScript-in-markup-expressions
    type StringType = string;
</script>

{#snippet componentWrapper(args: AlertDialogProps)}
    <button class="btn" onclick={() => alertDialog.open()}>Open Dialog</button>
    <AlertDialog bind:this={alertDialog} {...args} />
{/snippet}

<!-- A modal dialog with two options: confirm or cancel. -->
<Story name="Default">
    {#snippet template(args)}
        {@render componentWrapper(args)}
    {/snippet}
</Story>

<!-- The dialog can close in four ways: "Cancel" button, "Close" button, click overlay, "Escape" key. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        async function openDialog() {
            await step("Open dialog", async () => {
                await userEvent.click(canvas.getByRole("button", { name: /open/i }));
                await waitFor(() => expect(screen.getByRole("alertdialog")).toBeVisible());
                await waitFor(() => expect(args.onOpen).toHaveBeenCalledOnce());
                clearAllMocks();
            });
        }

        async function closeDialog(method: StringType = "cancelBtn") {
            await step("Close dialog", async () => {
                const dialogCanvas = within(screen.getByRole("alertdialog"));
                if (method === "cancelBtn") {
                    await userEvent.click(
                        dialogCanvas.getByRole("button", { name: args.cancelText }),
                    );
                } else if (method === "closeBtn") {
                    await userEvent.click(dialogCanvas.getByRole("button", { name: /close/i }));
                } else if (method === "clickOutside") {
                    await userEvent.click(screen.getByRole("alertdialog"));
                } else if (method === "keyboard") {
                    await userEvent.keyboard("{Escape}");
                } else {
                    throw new Error(`Unknown close method: ${method}`);
                }
                await waitForElementToBeRemoved(() => screen.queryByRole("alertdialog"));
                await waitFor(() => expect(args.onCancel).toHaveBeenCalledOnce());
                clearAllMocks();
            });
        }

        async function submitDialog() {
            await step("Submit dialog", async () => {
                const dialogCanvas = within(screen.getByRole("alertdialog"));
                await userEvent.click(dialogCanvas.getByRole("button", { name: args.confirmText }));
                await waitFor(() => expect(args.onConfirm).toHaveBeenCalledOnce());
                clearAllMocks();
            });
        }

        await step("Open and check dialog contents", async () => {
            await openDialog();
            const dialogCanvas = within(screen.getByRole("alertdialog"));
            if (args.title) {
                const titleElement = dialogCanvas.getByRole("heading", { name: args.title });
                await waitFor(() => expect(titleElement).toBeVisible());
            }
            if (args.description) {
                const descriptionElement = dialogCanvas.getByText(args.description);
                await waitFor(() => expect(descriptionElement).toBeVisible());
            }
            await closeDialog();
        });

        await step("Open and close dialog using all methods", async () => {
            for (const method of ["cancelBtn", "closeBtn", "clickOutside", "keyboard"]) {
                await openDialog();
                await closeDialog(method);
            }
        });

        await step("Open and submit dialog", async () => {
            await openDialog();
            await submitDialog();
        });
    }}
>
    {#snippet template(args)}
        {@render componentWrapper(args)}
    {/snippet}
</Story>
