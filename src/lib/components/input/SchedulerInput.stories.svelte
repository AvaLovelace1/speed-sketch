<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import SchedulerInput from "$lib/components/input/SchedulerInput.svelte";
    import type { Props as SchedulerInputProps } from "$lib/components/input/SchedulerInput.svelte";
    import { Tooltip } from "bits-ui";
    import { expect, within } from "storybook/test";

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

<!-- Schedule with break entries interspersed. -->
<Story
    name="With Breaks"
    args={{
        schedule: [
            { duration: 60, repeat: 20, id: "1" },
            { duration: 30, repeat: 1, id: "2", isBreak: true },
            { duration: 145, repeat: 10, id: "3" },
            { duration: 60, repeat: 1, id: "4", isBreak: true },
            { duration: 3611, repeat: 5, id: "5" },
        ],
    }}
/>

<!-- User can add, remove, and move rows of the schedule. -->
<Story
    name="With Interactions"
    args={{ schedule: [] }}
    play={async ({ args: _args, canvas, userEvent, step }) => {
        const addBtn = canvas.getByRole("button", { name: /add drawing/i });
        const addBreakBtn = canvas.getByRole("button", { name: /add break/i });
        const removeBtn = canvas.getByRole("button", { name: /remove/i });
        const moveUpBtn = canvas.getByRole("button", { name: /up/i });
        const moveDownBtn = canvas.getByRole("button", { name: /down/i });

        function getRow(rowIdx: NumberType) {
            return canvas.getAllByRole("option")[rowIdx];
        }

        function getNumImgsInput(rowIdx: NumberType) {
            const row = getRow(rowIdx);
            return within(row).getByRole("spinbutton", { name: /images/i });
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

        // Check that the schedule entries match the expected number of images.
        // expectedNumImgs[i] = null if the entry is a break.
        async function expectEntries(expectedNumImgs: (NumberType | null)[]) {
            const rows = canvas.queryAllByRole("option");
            await expect(rows).toHaveLength(expectedNumImgs.length);
            for (let i = 0; i < expectedNumImgs.length; i++) {
                if (expectedNumImgs[i] === null) await expect(rows[i]).toHaveTextContent(/break/i);
                else {
                    await expect(getNumImgsInput(i)).toHaveValue(expectedNumImgs[i]);
                    await expect(rows[i]).not.toHaveTextContent(/break/i);
                }
            }
        }

        await step("When schedule is empty, only add buttons are enabled", async () => {
            await expect(addBtn).toBeEnabled();
            await expect(addBreakBtn).toBeEnabled();
            await expect(removeBtn).toBeDisabled();
            await expect(moveUpBtn).toBeDisabled();
            await expect(moveDownBtn).toBeDisabled();
        });

        await step("Add three new entries", async () => {
            await userEvent.click(addBtn);
            await userEvent.click(addBreakBtn);
            await userEvent.click(addBtn);
            await expectEntries([1, null, 1]);
        });

        await step("Edit entries", async () => {
            await editEntry(0, 1);
            await editEntry(2, 3);
            await expectEntries([1, null, 3]);
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
            await expectEntries([null, 1, 3]);
            await expectSelectedEntry(1);
        });

        await step("Move the last entry up", async () => {
            await selectEntry(2);
            await userEvent.click(moveUpBtn);
            await expectEntries([null, 3, 1]);
            await expectSelectedEntry(1);
        });

        await step("Remove an entry", async () => {
            await selectEntry(1);
            await userEvent.click(removeBtn);
            await expectEntries([null, 1]);
            await expectSelectedEntry(1);
        });
    }}
/>
