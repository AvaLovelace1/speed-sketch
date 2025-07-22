<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Select from "./Select.svelte";
    import { expect, screen, within } from "storybook/test";

    const { Story } = defineMeta({
        title: "Atoms/Select",
        component: Select,
        tags: ["autodocs"],
        args: {
            label: "Select an option",
            items: [
                { value: "option1", label: "Option 1", icon: "lucide--tally-1" },
                { value: "option2", label: "Option 2", icon: "lucide--tally-2" },
                { value: "option3", label: "Option 3", icon: "lucide--tally-3" },
            ],
        },
    });

    // Workaround for bug https://youtrack.jetbrains.com/issue/WEB-61819/Svelte-5-TypeScript-in-markup-expressions
    type NumberType = number;
</script>

<!-- A dropdown select component with options. -->
<Story name="Default" />

<!-- The user can select an option from the dropdown. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        async function selectOption(num: NumberType) {
            await step(`Set option to ${num}`, async () => {
                const item = args.items[num];
                const selectBtn = canvas.getByRole("button", { name: args.label });
                await userEvent.click(selectBtn);
                const listboxCanvas = within(screen.getByRole("listbox"));
                await userEvent.click(listboxCanvas.getByRole("option", { name: item.label }));
                await expect(selectBtn).toHaveTextContent(item.label);
            });
        }
        for (let i = 0; i < args.items.length; i++) await selectOption(i);
    }}
/>
