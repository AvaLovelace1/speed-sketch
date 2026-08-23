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
    play={async ({ canvas, userEvent, step }) => {
        const addBtn = canvas.getByRole("button", { name: /add drawing/i });
        const addBreakBtn = canvas.getByRole("button", { name: /add break/i });
        const removeBtn = canvas.getByRole("button", { name: /remove/i });
        const moveUpBtn = canvas.getByRole("button", { name: /up/i });
        const moveDownBtn = canvas.getByRole("button", { name: /down/i });

        async function expectTotals(drawings: string | RegExp, duration: string | RegExp) {
            await expect(canvas.getByTestId("total drawings")).toHaveTextContent(drawings);
            await expect(canvas.getByTestId("total duration")).toHaveTextContent(duration);
        }

        function getRow(rowIdx: number) {
            return canvas.getAllByRole("row")[rowIdx];
        }

        function getNumImgsInput(rowIdx: number) {
            const row = getRow(rowIdx);
            return within(row).getByRole("spinbutton", { name: /drawings/i });
        }

        function getDurationInputs(rowIdx: number) {
            const row = getRow(rowIdx);
            return {
                hour: within(row).getByRole("spinbutton", { name: /hour/i }),
                minute: within(row).getByRole("spinbutton", { name: /minute/i }),
                second: within(row).getByRole("spinbutton", { name: /second/i }),
            };
        }

        async function selectEntry(rowIdx: number) {
            await userEvent.click(getRow(rowIdx));
            await expectSelectedEntry(rowIdx);
        }

        async function expectSelectedEntry(rowIdx: number) {
            await expect(getRow(rowIdx)).toHaveAttribute("aria-selected", "true");
        }

        // Edit the number of images and duration of a schedule entry
        async function editEntry(
            rowIdx: number,
            content: {
                numImgs: number | null;
                duration: { hour: number; minute: number; second: number };
            },
        ) {
            const { numImgs, duration } = content;

            if (numImgs !== null) {
                const numImgsInput = getNumImgsInput(rowIdx);
                await userEvent.clear(numImgsInput);
                await userEvent.type(numImgsInput, numImgs.toString());
                await userEvent.keyboard("{Enter}");
            }

            const durationInputs = getDurationInputs(rowIdx);
            await userEvent.type(durationInputs.hour, duration.hour.toString());
            await userEvent.type(durationInputs.minute, duration.minute.toString());
            await userEvent.type(durationInputs.second, duration.second.toString());
        }

        // Check that the schedule entries match the expected number of images and duration.
        // expectedNumImgs[i] = null if the entry is a break.
        async function expectEntries(
            expectedContent: {
                numImgs: number | null;
                duration: { hour: number; minute: number; second: number };
            }[],
        ) {
            const rows = canvas.queryAllByRole("row");
            await expect(rows).toHaveLength(expectedContent.length);
            for (let i = 0; i < expectedContent.length; i++) {
                const { numImgs, duration } = expectedContent[i];
                const row = rows[i];

                if (numImgs === null) await expect(row).toHaveTextContent(/break/i);
                else {
                    await expect(row).not.toHaveTextContent(/break/i);
                    await expect(getNumImgsInput(i)).toHaveValue(numImgs);
                }

                await expect(getDurationInputs(i).hour).toHaveValue(duration.hour);
                await expect(getDurationInputs(i).minute).toHaveValue(duration.minute);
                await expect(getDurationInputs(i).second).toHaveValue(duration.second);
            }
        }

        await step("When schedule is empty, only add buttons are enabled", async () => {
            await expect(addBtn).toBeEnabled();
            await expect(addBreakBtn).toBeEnabled();
            await expect(removeBtn).toBeDisabled();
            await expect(moveUpBtn).toBeDisabled();
            await expect(moveDownBtn).toBeDisabled();
        });

        await step("Empty schedule has 0 drawings and 0 duration", async () => {
            await expectTotals(/^0$/, /^0s$/);
        });

        await step("Add three new entries", async () => {
            await userEvent.click(addBtn);
            await userEvent.click(addBreakBtn);
            await userEvent.click(addBtn);
            await expectEntries([
                { numImgs: 1, duration: { hour: 0, minute: 1, second: 0 } },
                { numImgs: null, duration: { hour: 0, minute: 0, second: 30 } },
                { numImgs: 1, duration: { hour: 0, minute: 1, second: 0 } },
            ]);
            await expectTotals(/^2$/, /^2m 30s$/);
        });

        const newEntry0 = { numImgs: 1, duration: { hour: 2, minute: 0, second: 0 } };
        const newEntry1 = { numImgs: null, duration: { hour: 0, minute: 2, second: 0 } };
        const newEntry2 = { numImgs: 1, duration: { hour: 0, minute: 0, second: 2 } };

        await step("Edit entries", async () => {
            await editEntry(0, newEntry0);
            await editEntry(1, newEntry1);
            await editEntry(2, newEntry2);
            await expectEntries([newEntry0, newEntry1, newEntry2]);
            await expectTotals(/^2$/, /^2h 2m$/); // duration is abbreviated to 2 units
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
            await expectEntries([newEntry1, newEntry0, newEntry2]);
            await expectSelectedEntry(1);
        });

        await step("Move the last entry up", async () => {
            await selectEntry(2);
            await userEvent.click(moveUpBtn);
            await expectEntries([newEntry1, newEntry2, newEntry0]);
            await expectSelectedEntry(1);
        });

        await step("Remove an entry", async () => {
            await selectEntry(1);
            await userEvent.click(removeBtn);
            await expectEntries([newEntry1, newEntry0]);
            await expectSelectedEntry(1);
        });
    }}
/>
