<script lang="ts">
    import type {HTMLButtonAttributes} from 'svelte/elements';

    interface Control extends HTMLButtonAttributes {
        label: string;
        icon?: string;
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
    {#each controls as {label, icon, action, hotkey, ...others}}
        <button onclick={action} {...others} class={['btn join-item btn-soft', others.class]}>
            <span class="iconify {icon}"></span>{label}
        </button>
    {/each}
</div>
