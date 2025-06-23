<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Select from "$lib/components/Select.svelte";
    import Slider from "$lib/components/Slider.svelte";
    import { contrastOptions, blurOptions, themes, settings } from "$lib/globals.svelte";

    interface Props {
        onOpen?: () => void;
        onClose?: () => void;
    }

    let { onOpen = () => {}, onClose = () => {} }: Props = $props();

    let dialog: Dialog;

    export function open() {
        dialog.open();
    }

    export function setOnOpen(fn: () => void) {
        dialog.setOnOpen(fn);
    }

    export function setOnClose(fn: () => void) {
        dialog.setOnClose(fn);
    }
</script>

<Dialog bind:this={dialog} title="Settings" {onOpen} {onClose}>
    <!-- Theme picker -->
    <div class="mb-6">
        <Select
            label="Theme"
            bind:value={settings.theme}
            items={new Map(
                themes.map((t) => [t.name, { value: t.name, label: t.label, icon: t.icon }]),
            )}
        />
    </div>
    <!-- Contrast -->
    <div class="mb-4">
        <Slider
            label="Contrast filter strength"
            icon="lucide--contrast"
            min={0}
            max={contrastOptions.length - 1}
            step={1}
            bind:value={settings.contrastStrength}
        />
    </div>
    <div class="mb-4">
        <Slider
            label="Blur strength"
            icon="lucide--droplet"
            min={0}
            max={blurOptions.length - 1}
            step={1}
            bind:value={settings.blurStrength}
        />
    </div>
</Dialog>
