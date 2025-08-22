<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import SchedulerInput from "$lib/components/input/SchedulerInput.svelte";
    import type { Props as SchedulerInputProps } from "$lib/components/input/SchedulerInput.svelte";
    import { Tooltip } from "bits-ui";
    import { expect } from "storybook/test";

    const { Story } = defineMeta({
        title: "Components/Input/SchedulerInput",
        component: SchedulerInput,
        tags: ["autodocs"],
        render: template,
        args: {
            schedule: [
                { duration: 60, repeat: 20, id: "1" },
                { duration: 145, repeat: 10, id: "2" },
                { duration: 3611, repeat: 5, id: "3" },
            ],
        },
    });

    // Workaround for bug https://youtrack.jetbrains.com/issue/WEB-61819/Svelte-5-TypeScript-in-markup-expressions
    type NumberType = number;
</script>

{#snippet template(args: SchedulerInputProps)}
    <Tooltip.Provider>
        <SchedulerInput {...args} bind:schedule={args.schedule} />
    </Tooltip.Provider>
{/snippet}

<!-- UI for the user to create a session schedule. -->
<Story name="Default" />

<!-- When empty, the UI displays a prompt to add an entry. -->
<Story name="Empty" args={{ schedule: [] }} />

<!-- User can add, remove, and move rows of the schedule. -->
<Story
    name="With Interactions"
    args={{ schedule: [] }}
    play={async ({ args: _args, canvas, userEvent, step }) => {
        const addBtn = canvas.getByRole("button", { name: /add/i });
        const removeBtn = canvas.getByRole("button", { name: /remove/i });
        const moveUpBtn = canvas.getByRole("button", { name: /up/i });
        const moveDownBtn = canvas.getByRole("button", { name: /down/i });

        function getRow(rowIdx: NumberType) {
            return canvas.getAllByRole("row")[rowIdx];
        }

        function getNumImgsInput(rowIdx: NumberType) {
            return canvas.getAllByRole("spinbutton", { name: /images/ })[rowIdx];
        }

        async function selectEntry(rowIdx: NumberType) {
            await userEvent.click(getRow(rowIdx));
            await expectSelectedEntry(rowIdx);
        }

        async function expectSelectedEntry(rowIdx: NumberType) {
            await expect(getRow(rowIdx)).toHaveAttribute("aria-selected", "true");
        }

        async function editEntry(rowIdx: NumberType, numImgs: NumberType) {
            const numImgsInput = getNumImgsInput(rowIdx);
            await userEvent.clear(numImgsInput);
            await userEvent.type(numImgsInput, numImgs.toString());
            await userEvent.keyboard("{Enter}");
        }

        async function expectEntries(expectedNumImgs: NumberType[]) {
            const rows = canvas.queryAllByRole("row");
            await expect(rows).toHaveLength(expectedNumImgs.length);
            for (let i = 0; i < expectedNumImgs.length; i++) {
                await expect(getNumImgsInput(i)).toHaveValue(expectedNumImgs[i]);
            }
        }

        await step("When schedule is empty, only add button is enabled", async () => {
            await expect(addBtn).toBeEnabled();
            await expect(removeBtn).toBeDisabled();
            await expect(moveUpBtn).toBeDisabled();
            await expect(moveDownBtn).toBeDisabled();
        });

        await step("Add three new entries", async () => {
            await userEvent.click(addBtn);
            await userEvent.click(addBtn);
            await userEvent.click(addBtn);
            await expectEntries([1, 1, 1]);
        });

        await step("Edit entries", async () => {
            await editEntry(0, 1);
            await editEntry(1, 2);
            await editEntry(2, 3);
            await expectEntries([1, 2, 3]);
        });

        await step("Select the first entry", async () => {
            await selectEntry(0);
            await expect(removeBtn).toBeEnabled();
            await expect(moveUpBtn).toBeDisabled();
            await expect(moveDownBtn).toBeEnabled();
        });

        await step("Select the middle entry", async () => {
            await selectEntry(1);
            await expect(removeBtn).toBeEnabled();
            await expect(moveUpBtn).toBeEnabled();
            await expect(moveDownBtn).toBeEnabled();
        });

        await step("Select the last entry", async () => {
            await selectEntry(2);
            await expect(removeBtn).toBeEnabled();
            await expect(moveUpBtn).toBeEnabled();
            await expect(moveDownBtn).toBeDisabled();
        });

        await step("Move the first entry down", async () => {
            await selectEntry(0);
            await userEvent.click(moveDownBtn);
            await expectEntries([2, 1, 3]);
            await expectSelectedEntry(1);
        });

        await step("Move the last entry up", async () => {
            await selectEntry(2);
            await userEvent.click(moveUpBtn);
            await expectEntries([2, 3, 1]);
            await expectSelectedEntry(1);
        });

        await step("Remove an entry", async () => {
            await selectEntry(1);
            await userEvent.click(removeBtn);
            await expectEntries([2, 1]);
            await expectSelectedEntry(1);
        });
    }}
/>
