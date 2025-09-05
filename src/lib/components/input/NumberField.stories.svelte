<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import NumberField from "./NumberField.svelte";
    import type { Props as NumberFieldProps } from "./NumberField.svelte";
    import { expect } from "storybook/test";

    const { Story } = defineMeta({
        title: "Components/Input/NumberField",
        component: NumberField,
        tags: ["autodocs"],
        render: template,
        args: { value: 1, id: "number-field", minValue: 1, maxValue: 999 },
    });
</script>

{#snippet template(args: NumberFieldProps)}
    <label class="mb-2 block text-sm text-muted" for={args.id}>Number field</label>
    <NumberField {...args} />
{/snippet}

<!-- A number entry field with a minimum and maximum value. -->
<Story name="Default" />

<!-- On a colored background. -->
<Story name="Primary Background" args={{ bgColor: "primary" }}>
    {#snippet template(args)}
        <div class="rounded bg-primary p-4">
            <label class="mb-2 block text-sm text-primary-content" for={args.id}>
                Number field
            </label>
            <NumberField {...args} />
        </div>
    {/snippet}
</Story>

<!-- The field prevents non-digit numbers from being entered and enforces the minimum and maximum values on change. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        const inputElem = canvas.getByRole("spinbutton");
        const minValue = args.minValue ?? 1;
        const maxValue = args.maxValue ?? 999;

        await step("Type non-digit characters", async () => {
            await userEvent.clear(inputElem);
            await userEvent.type(inputElem, "abc!@#123");
            await expect(inputElem).toHaveValue(123);
        });

        await step("Type a number below the minimum", async () => {
            await userEvent.clear(inputElem);
            await userEvent.type(inputElem, (minValue - 1).toString());
            await userEvent.keyboard("{Enter}");
            await expect(inputElem).toHaveValue(minValue);
        });

        await step("Type a number above the maximum", async () => {
            await userEvent.clear(inputElem);
            await userEvent.type(inputElem, (maxValue + 1).toString());
            await userEvent.keyboard("{Enter}");
            await expect(inputElem).toHaveValue(maxValue);
        });
    }}
/>
