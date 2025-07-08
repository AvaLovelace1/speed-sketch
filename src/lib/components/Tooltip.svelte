<script lang="ts">
    import { Tooltip } from "bits-ui";
    import { fly } from "svelte-reduced-motion/transition";
    import type { Snippet } from "svelte";

    interface Props extends Tooltip.TriggerProps {
        children: Snippet;
        tooltipContent: Snippet;
        side?: "top" | "right" | "bottom" | "left";
    }

    const { children, tooltipContent, side = "bottom", ...triggerProps }: Props = $props();
    const flyAmount = 4;
    const flyTransition = {
        x: side === "left" ? flyAmount : side === "right" ? -flyAmount : 0,
        y: side === "top" ? flyAmount : side === "bottom" ? -flyAmount : 0,
        duration: 100,
    };
</script>

<Tooltip.Root>
    <Tooltip.Trigger {...triggerProps}>
        {@render children()}
    </Tooltip.Trigger>
    <Tooltip.Portal>
        <Tooltip.Content {side} sideOffset={4} forceMount>
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div transition:fly={flyTransition}>
                            <div
                                class="bg-neutral text-neutral-content shadow-offblack/10 rounded-lg px-2 py-1 text-center text-sm shadow-md"
                                {...props}
                            >
                                {@render tooltipContent()}
                            </div>
                            <Tooltip.Arrow class="text-neutral" />
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Tooltip.Content>
    </Tooltip.Portal>
</Tooltip.Root>
