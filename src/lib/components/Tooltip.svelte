<script lang="ts">
    import { Tooltip } from "bits-ui";
    import { fly } from "$lib/motion.svelte";
    import type { Snippet } from "svelte";

    export interface Props extends Tooltip.TriggerProps {
        tooltipContent: Snippet;
        side?: "top" | "right" | "bottom" | "left";
    }

    const { children, tooltipContent, side = "bottom", ...triggerProps }: Props = $props();

    const flyAmount = 4;
    const xFlyAmount = side === "left" ? flyAmount : side === "right" ? -flyAmount : 0;
    const yFlyAmount = side === "top" ? flyAmount : side === "bottom" ? -flyAmount : 0;
    const flyTransition = { x: xFlyAmount, y: yFlyAmount, duration: "short" } as const;
</script>

<Tooltip.Root>
    <Tooltip.Trigger {...triggerProps}>{@render children?.()}</Tooltip.Trigger>
    <Tooltip.Portal>
        <Tooltip.Content role="tooltip" {side} sideOffset={4} forceMount>
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div transition:fly={flyTransition}>
                            <div
                                class="rounded-lg bg-neutral px-2 py-1 text-center text-sm text-neutral-content shadow-md"
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
