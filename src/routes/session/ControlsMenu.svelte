<script lang="ts">
    import {type Component} from 'svelte';

    interface Control {
        label: string;
        Icon?: Component;
        action: () => void;
        hotkey?: string;

        [key: string]: any;
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

<div class="join rounded shadow-sm">
    {#each controls as {label, Icon, action, ...others}}
        <button onclick={action} {...others} class={['btn join-item btn-soft', others.class]}>
            <Icon size={20}/>{label}
        </button>
    {/each}
</div>
