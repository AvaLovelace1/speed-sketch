<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Select from "$lib/components/Select.svelte";
    import { themes, settings } from "$lib/globals.svelte";

    interface Props {
        onOpen?: () => void;
        onClose?: () => void;
    }

    let { onOpen = () => {}, onClose = () => {} }: Props = $props();

    let dialog: Dialog;

    export function open() {
        dialog.open();
    }
</script>

<Dialog bind:this={dialog} title="Settings" {onOpen} {onClose}>
    <!-- Theme picker -->
    <div class="text-muted mb-2">Theme</div>
    <Select
        bind:value={settings.theme}
        items={new Map(
            themes.map((t) => [t.name, { value: t.name, label: t.label, icon: t.icon }]),
        )}
    />
</Dialog>
