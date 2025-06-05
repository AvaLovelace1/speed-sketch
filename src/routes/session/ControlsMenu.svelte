<script lang="ts">
    import type {Component} from 'svelte';
    import type {HTMLButtonAttributes} from 'svelte/elements';

    interface Control extends HTMLButtonAttributes {
        label: string;
        Icon?: Component;
        action: () => void;
        hotkey?: string;
    }

    interface Props {
        controls: Control[];
    }

    let {controls}: Props = $props();

    function onKeyDown(e: KeyboardEvent) {
        for (const control of controls) {
            if (control.hotkey && e.key === control.hotkey) {
                e.preventDefault();
                control.action();
                break;
            }
        }
    }
</script>

<svelte:window onkeydown={onKeyDown}/>

<div role="toolbar" class="join rounded shadow-sm">
    {#each controls as {label, Icon, action, hotkey, ...others}}
        <button onclick={action} {...others} class={['btn join-item btn-soft', others.class]}>
            <Icon size={20}/>{label}
        </button>
    {/each}
</div>
