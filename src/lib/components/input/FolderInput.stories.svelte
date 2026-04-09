<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import FolderInput from "$lib/components/input/FolderInput.svelte";
    import type { Props as FolderInputProps } from "$lib/components/input/FolderInput.svelte";
    import { Tooltip } from "bits-ui";
    import { clearAllMocks, expect, fn } from "storybook/test";

    const { Story } = defineMeta({
        title: "Components/Input/FolderInput",
        component: FolderInput,
        tags: ["autodocs"],
        render: template,
        args: {
            folders: [
                "/Users/user/Pictures/Landscapes",
                "/Users/user/Pictures/Portraits",
                "/Users/user/Pictures/Animals",
            ],
            onAdd: fn(),
            onChange: fn(),
        },
    });

    // Workaround for bug https://youtrack.jetbrains.com/issue/WEB-61819/Svelte-5-TypeScript-in-markup-expressions
    type NumberType = number;
</script>

{#snippet template(args: FolderInputProps)}
    <Tooltip.Provider>
        <FolderInput {...args} bind:folders={args.folders} />
    </Tooltip.Provider>
{/snippet}

<!-- Displays a list of image folders with add/remove/move controls. -->
<Story name="Default" />

<!-- When empty, the UI displays a prompt to add a folder. -->
<Story name="Empty" args={{ folders: [] }} />

<!-- User can add, remove, and move folders in the list. -->
<Story
    name="With Interactions"
    args={{
        folders: ["/path/to/folder1", "/path/to/folder2", "/path/to/folder3"],
        onAdd: async () => ["/path/to/new-folder"],
    }}
    play={async ({ args, canvas, userEvent, step }) => {
        const addBtn = canvas.getByRole("button", { name: /add folder/i });
        const removeBtn = canvas.getByRole("button", { name: /remove/i });
        const moveUpBtn = canvas.getByRole("button", { name: /up/i });
        const moveDownBtn = canvas.getByRole("button", { name: /down/i });

        function getOption(idx: NumberType) {
            return canvas.getAllByRole("row")[idx];
        }

        async function selectEntry(idx: NumberType) {
            await userEvent.click(getOption(idx));
        }

        await step("Initial state has 3 folders", async () => {
            const options = canvas.getAllByRole("row");
            await expect(options).toHaveLength(3);
            await expect(options[0]).toHaveTextContent(/folder1/);
            await expect(options[1]).toHaveTextContent(/folder2/);
            await expect(options[2]).toHaveTextContent(/folder3/);
        });

        await step("First entry is selected by default", async () => {
            await expect(getOption(0)).toHaveAttribute("aria-selected", "true");
        });

        await step("Select first entry - move up disabled, move down enabled", async () => {
            await selectEntry(0);
            await expect(moveUpBtn).toBeDisabled();
            await expect(moveDownBtn).toBeEnabled();
            await expect(removeBtn).toBeEnabled();
        });

        await step("Select last entry - move down disabled, move up enabled", async () => {
            await selectEntry(2);
            await expect(moveUpBtn).toBeEnabled();
            await expect(moveDownBtn).toBeDisabled();
        });

        await step("Move first folder down", async () => {
            await selectEntry(0);
            await userEvent.click(moveDownBtn);
            const options = canvas.getAllByRole("row");
            await expect(options[0]).toHaveTextContent(/folder2/);
            await expect(options[1]).toHaveTextContent(/folder1/);
            await expect(getOption(1)).toHaveAttribute("aria-selected", "true");
        });

        await step("Move last folder up", async () => {
            await selectEntry(2);
            await userEvent.click(moveUpBtn);
            const options = canvas.getAllByRole("row");
            await expect(options[1]).toHaveTextContent(/folder3/);
            await expect(options[2]).toHaveTextContent(/folder1/);
            await expect(getOption(1)).toHaveAttribute("aria-selected", "true");
        });

        await step("Remove selected folder", async () => {
            await selectEntry(1);
            await userEvent.click(removeBtn);
            const options = canvas.getAllByRole("row");
            await expect(options).toHaveLength(2);
            await expect(args.onChange).toHaveBeenCalledOnce();
            clearAllMocks();
        });

        await step("Add a new folder", async () => {
            await userEvent.click(addBtn);
            const options = canvas.getAllByRole("row");
            await expect(options).toHaveLength(3);
            await expect(options[2]).toHaveTextContent(/new-folder/);
            await expect(args.onChange).toHaveBeenCalledOnce();
            clearAllMocks();
        });
    }}
/>
