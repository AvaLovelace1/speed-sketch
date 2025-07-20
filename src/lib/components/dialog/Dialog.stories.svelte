<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import type { Props as DialogProps } from "$lib/components/dialog/Dialog.svelte";
    import {
        fn,
        within,
        screen,
        expect,
        waitFor,
        waitForElementToBeRemoved,
        clearAllMocks,
    } from "storybook/test";
    import { createRawSnippet } from "svelte";

    const { Story } = defineMeta({
        title: "Components/Dialog",
        component: Dialog,
        tags: ["autodocs"],
        args: {
            title: "Dialog",
            onOpen: fn(),
            onClose: fn(),
            children: createRawSnippet(() => ({
                render: () => "<p>This is the dialog body</p>",
            })),
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

    let dialog: Dialog;

    // Workaround for bug https://youtrack.jetbrains.com/issue/WEB-61819/Svelte-5-TypeScript-in-markup-expressions
    type StringType = string;
</script>

{#snippet componentWrapper(args: DialogProps)}
    <button class="btn" onclick={() => dialog.open()}>Open Dialog</button>
    <Dialog bind:this={dialog} {...args} />
{/snippet}

<!-- A modal dialog. -->
<Story name="Default">
    {#snippet template(args)}
        {@render componentWrapper(args)}
    {/snippet}
</Story>

<!-- The dialog can close in three ways: "Close" button, click overlay, "Escape" key. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        async function openDialog() {
            await step("Open dialog", async () => {
                await userEvent.click(canvas.getByRole("button", { name: /open/i }));
                await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
                await waitFor(() => expect(args.onOpen).toHaveBeenCalledOnce());
                clearAllMocks();
            });
        }

        async function closeDialog(method: StringType = "closeBtn") {
            await step("Close dialog", async () => {
                const dialogCanvas = within(screen.getByRole("dialog"));
                if (method === "closeBtn") {
                    await userEvent.click(dialogCanvas.getByRole("button", { name: /close/i }));
                } else if (method === "clickOutside") {
                    await userEvent.click(screen.getByRole("dialog"));
                } else if (method === "keyboard") {
                    await userEvent.keyboard("{Escape}");
                } else {
                    throw new Error(`Unknown close method: ${method}`);
                }
                await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
                await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
                clearAllMocks();
            });
        }

        await step("Open and check dialog contents", async () => {
            await openDialog();
            const dialogCanvas = within(screen.getByRole("dialog"));
            if (args.title) {
                const titleElement = dialogCanvas.getByRole("heading", { name: args.title });
                await waitFor(() => expect(titleElement).toBeVisible());
            }
            await closeDialog();
        });

        await step("Open and close dialog using all methods", async () => {
            for (const method of ["closeBtn", "clickOutside", "keyboard"]) {
                await openDialog();
                await closeDialog(method);
            }
        });
    }}
>
    {#snippet template(args)}
        {@render componentWrapper(args)}
    {/snippet}
</Story>
