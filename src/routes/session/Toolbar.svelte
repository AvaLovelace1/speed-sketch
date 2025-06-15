<!--
@component
A toolbar with a set of controls and keyboard shortcuts.
-->
<script lang="ts">
    import {Toolbar, type BitsPrimitiveButtonAttributes} from 'bits-ui';

    interface Control extends BitsPrimitiveButtonAttributes {
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
        // Ignore key events when the toolbar is focused
        if (document.activeElement?.closest('[data-toolbar-root]')) return;
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

<Toolbar.Root class="join rounded shadow-sm">
    {#each controls as {label, icon, action, hotkey, ...others}}
        <Toolbar.Button onclick={action} {...others} class={['btn join-item btn-soft', others.class]}>
            <span class="iconify {icon}"></span>{label}
        </Toolbar.Button>
    {/each}
</Toolbar.Root>
