<!--
@component
A toolbar with a set of tools/actions and keyboard shortcuts.
-->
<script lang="ts">
    import { Toolbar, type BitsPrimitiveElementAttributes } from "bits-ui";

    import Tooltip from "$lib/components/Tooltip.svelte";

    interface Tool extends BitsPrimitiveElementAttributes {
        // Unique identifier for the tool
        key: string | number;
        label: string;
        icon?: string;
        action: () => void;
        hotkey?: string;
        tooltip?: string;
    }

    interface Props extends BitsPrimitiveElementAttributes {
        tools: Tool[];
        enableHotkeys?: boolean;
    }

    const { tools, enableHotkeys = true, ...props }: Props = $props();

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
        ["ArrowLeft", "Left arrow"],
        ["ArrowRight", "Right arrow"],
        [" ", "Space"],
        ["Escape", "Esc"],
    ]);

    function getHotkeyLabel(hotkey: string): string {
        return hotkeyLabels.get(hotkey) || hotkey;
    }
</script>

<svelte:window onkeydown={onKeyDown} />

<Toolbar.Root {...props} class={["join rounded-field shadow-sm", props.class]}>
    {#each tools as { key, label, icon, action, hotkey, tooltip, ...others } (key)}
        <Tooltip
            side="top"
            onclick={action}
            {...others}
            class={["btn join-item btn-soft btn-square text-lg", others.class]}
            aria-label={label}
        >
            {#if icon}<span class="iconify {icon}"></span>{/if}
            {#snippet tooltipContent()}
                {#if tooltip}
                    <p>{tooltip}</p>
                    {#if hotkey}
                        <p class="mb-1">
                            <kbd class="kbd kbd-sm">{getHotkeyLabel(hotkey)}</kbd>
                        </p>
                    {/if}
                {/if}
            {/snippet}
        </Tooltip>
    {/each}
</Toolbar.Root>
