<script lang="ts">
    import { Tooltip } from "bits-ui";
    import { fly } from "$lib/motion.svelte";
    import type { Snippet } from "svelte";

    export interface Props extends Tooltip.TriggerProps {
        tooltipContent: Snippet;
        side?: "top" | "right" | "bottom" | "left";
        anchor?: HTMLElement | null;
    }

    const { children, tooltipContent, side = "bottom", anchor, ...triggerProps }: Props = $props();

    const shared = $derived(anchor !== undefined);
    const flyAmount = 4;
    const flyTransition = $derived({
        x: side === "left" ? flyAmount : side === "right" ? -flyAmount : 0,
        y: side === "top" ? flyAmount : side === "bottom" ? -flyAmount : 0,
        duration: "short",
    } as const);
</script>

{#snippet content()}
    <Tooltip.Portal>
        <Tooltip.Content role="tooltip" {side} sideOffset={4} customAnchor={anchor} forceMount>
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <!-- Set `z-index` so the tooltip appears in front of dialogs.
                         Override it inline, since a class would lose to bits-ui's inline style -->
                    <div {...wrapperProps} style="{wrapperProps.style}; z-index: 60">
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
{/snippet}

{#if shared}
    <Tooltip.Root open={anchor !== null}>
        {@render content()}
    </Tooltip.Root>
{:else}
    <Tooltip.Root>
        <Tooltip.Trigger {...triggerProps}>{@render children?.()}</Tooltip.Trigger>
        {@render content()}
    </Tooltip.Root>
{/if}
