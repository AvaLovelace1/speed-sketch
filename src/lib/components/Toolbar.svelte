<!--
@component
A toolbar with a set of tools/actions and keyboard shortcuts.
-->
<script lang="ts">
    import { Toolbar, Tooltip } from "bits-ui";
    import CustomTooltip from "$lib/components/Tooltip.svelte";

    export interface Tool extends Tooltip.TriggerProps {
        // Unique identifier for the tool
        uid: string;
        icon: string;
        tooltip: string;
        action: (() => void) | (() => Promise<void>);
        hotkey?: string;
    }

    export interface Props extends Toolbar.RootProps {
        tools: Tool[];
        toolbarStyle?: "default" | "small";
        tooltipSide?: "top" | "bottom" | "left" | "right";
    }

    const { tools, toolbarStyle = "default", tooltipSide = "top", ...props }: Props = $props();

    function onKeyDown(e: KeyboardEvent) {
        for (const tool of tools) {
            if (tool.hotkey && !tool.disabled && e.key === tool.hotkey) {
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

    const toolbarClass = toolbarStyle === "small" ? "flex gap-2" : "join rounded-field shadow-md";
    const itemClass =
        toolbarStyle === "small"
            ? "btn btn-circle btn-soft btn-sm text-base"
            : "btn join-item px-3 py-5 text-lg btn-soft";
</script>

<svelte:window onkeydown={onKeyDown} />

<Toolbar.Root {...props} class={[toolbarClass, props.class]}>
    {#each tools as { uid, icon, action, hotkey, tooltip, ...others } (uid)}
        <CustomTooltip
            side={tooltipSide}
            onclick={action}
            {...others}
            class={[itemClass, others.class]}
        >
            <span class="iconify {icon}"></span>
            <span class="sr-only">{tooltip}</span>
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
