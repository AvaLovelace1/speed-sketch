<!--
@component
A toolbar with a set of tools/actions and keyboard shortcuts.
-->
<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import { Toolbar } from 'bits-ui';

    interface Tool extends HTMLButtonAttributes {
        // Unique identifier for the tool
        key: string | number;
        label: string;
        icon?: string;
        action: () => void;
        hotkey?: string;
        tooltip?: string;
    }

    interface Props {
        tools: Tool[];
    }

    const { tools }: Props = $props();

    function onKeyDown(e: KeyboardEvent) {
        for (const tool of tools) {
            if (tool.hotkey && e.key === tool.hotkey) {
                e.preventDefault();
                tool.action();
                break;
            }
        }
    }

    const hotkeyLabels = new Map([
        ['ArrowLeft', 'Left arrow'],
        ['ArrowRight', 'Right arrow'],
        [' ', 'Space'],
        ['Escape', 'Esc'],
    ]);

    function getHotkeyLabel(hotkey: string): string {
        return hotkeyLabels.get(hotkey) || hotkey;
    }
</script>

<svelte:window onkeydown={onKeyDown} />

<Toolbar.Root class="join rounded shadow-sm">
    {#each tools as { key, label, icon, action, hotkey, tooltip, ...others } (key)}
        <div class="tooltip">
            {#if tooltip}
                <div class="tooltip-content">
                    <p class="mb-1">{tooltip}</p>
                    {#if hotkey}
                        <p class="mb-1"><kbd class="kbd kbd-sm">{getHotkeyLabel(hotkey)}</kbd></p>
                    {/if}
                </div>
            {/if}
            <button onclick={action} {...others} class={['btn join-item btn-soft', others.class]}>
                {#if icon}<span class="iconify {icon}"></span>{/if}{label}
            </button>
        </div>
    {/each}
</Toolbar.Root>
