<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { Tooltip as BitsTooltip } from "bits-ui";
    import Tooltip from "./Tooltip.svelte";
    import type { Props as TooltipProps } from "./Tooltip.svelte";
    import { expect, waitFor, screen } from "storybook/test";

    const { Story } = defineMeta({
        title: "Atoms/Tooltip",
        component: Tooltip,
        tags: ["autodocs"],
        render: template,
        args: { class: "btn btn-primary" },
    });

    const BUTTON_NAME = "Hover me";
    const TOOLTIP_TEXT = "Tooltip text";
</script>

{#snippet template({ children: _children, ...args }: TooltipProps)}
    <BitsTooltip.Provider>
        <Tooltip {...args}>
            {BUTTON_NAME}
            {#snippet tooltipContent()}<p>{TOOLTIP_TEXT}</p>{/snippet}
        </Tooltip>
    </BitsTooltip.Provider>
{/snippet}

<!-- A basic tooltip. -->
<Story name="Default" />

<!-- Tooltip appears on hover. -->
<Story
    name="With Interactions"
    play={async ({ canvas, userEvent, step }) => {
        await step("Hover to show tooltip", async () => {
            const tooltipTrigger = canvas.getByRole("button", { name: BUTTON_NAME });
            await userEvent.hover(tooltipTrigger);
            const tooltipContent = await screen.findByRole("tooltip");
            await waitFor(() => expect(tooltipContent).toBeVisible());
            await expect(tooltipContent).toHaveTextContent(TOOLTIP_TEXT);
        });
    }}
/>
