<!--
@component
A toolbar with a set of tools/actions and keyboard shortcuts.
-->
<script lang="ts">
    import { Toolbar, Tooltip, type BitsPrimitiveElementAttributes } from "bits-ui";
    import CustomTooltip from "$lib/components/Tooltip.svelte";

    interface Tool extends BitsPrimitiveElementAttributes {
        // Unique identifier for the tool
        key: string | number;
        icon: string;
        tooltip: string;
        action: () => void;
        hotkey?: string;
    }

    interface Props extends Toolbar.RootProps {
        tools: Tool[];
        enableHotkeys?: boolean;
        // Whether to wrap in a Tooltip.Provider (necessary if ancestor is not already wrapped)
        includeTooltipProvider?: boolean;
    }

    const {
        tools,
        enableHotkeys = true,
        includeTooltipProvider = false,
        ...props
    }: Props = $props();

    function onKeyDown(e: KeyboardEvent) {
        if (!enableHotkeys) return;
        for (const tool of tools) {
            if (tool.hotkey && e.key === tool.hotkey) {
                e.preventDefault();
                tool.action();
                break;
            }
        }
    }

    const hotkeyLabels = new Map([
        ["ArrowLeft", ["←"]],
        ["ArrowRight", ["→"]],
        [" ", ["Space"]],
        ["Escape", ["Esc"]],
    ]);

    function getHotkeyLabel(hotkey: string): string[] {
        if (hotkey.match(/^[a-z]$/)) return [hotkey.toUpperCase()];
        if (hotkey.match(/^[A-Z]$/)) return ["Shift", hotkey];
        return hotkeyLabels.get(hotkey) || [hotkey];
    }
</script>

<svelte:window onkeydown={onKeyDown} />

{#snippet main()}
    <Toolbar.Root {...props} class={["join rounded-field shadow-md", props.class]}>
        {#each tools as { key, icon, action, hotkey, tooltip, ...others } (key)}
            <CustomTooltip
                side="top"
                onclick={action}
                {...others}
                class={["btn join-item btn-soft px-3 py-5 text-lg", others.class]}
            >
                <span class="sr-only">{tooltip}</span>
                <span class="iconify {icon}"></span>
                {#snippet tooltipContent()}
                    <p>{tooltip}</p>
                    {#if hotkey}
                        <p class="mb-1">
                            {#each getHotkeyLabel(hotkey) as part, i (i)}
                                {#if i > 0}<span class="text-muted">&nbsp;+</span>{/if}
                                <kbd class="kbd kbd-sm">{part}</kbd>
                            {/each}
                        </p>
                    {/if}
                {/snippet}
            </CustomTooltip>
        {/each}
    </Toolbar.Root>
{/snippet}

{#if includeTooltipProvider}
    <Tooltip.Provider>
        {@render main()}
    </Tooltip.Provider>
{:else}
    {@render main()}
{/if}
