<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Select from "$lib/components/Select.svelte";
    import Slider from "$lib/components/Slider.svelte";
    import { contrastOptions, blurOptions, themes, settings } from "$lib/globals.svelte";
    import startAudioFile from "$lib/assets/audio/start.wav";

    interface Props {
        onOpen?: () => void;
        onClose?: () => void;
        save?: () => Promise<void>;
    }

    let { onOpen = () => {}, onClose = () => {}, save = async () => {} }: Props = $props();

    let volumeIcon = $derived.by(() => {
        if (settings.volume === 0) return "lucide--volume-x";
        if (settings.volume < 0.5) return "lucide--volume-1";
        return "lucide--volume-2";
    });
    let dialog: Dialog;

    async function onCloseWithSave() {
        await save();
        onClose();
    }

    export function open() {
        dialog.open();
    }

    export function setOnOpen(fn: () => void) {
        dialog.setOnOpen(fn);
    }

    export function setOnClose(fn: () => void) {
        dialog.setOnClose(async () => {
            await save();
            fn();
        });
    }
</script>

<Dialog bind:this={dialog} title="Settings" {onOpen} onClose={onCloseWithSave}>
    <!-- Theme picker -->
    <div class="mb-4">
        <Select
            label="Theme"
            bind:value={settings.theme}
            items={new Map(
                themes.map((t) => [t.name, { value: t.name, label: t.label, icon: t.icon }]),
            )}
        />
    </div>
    <!-- Volume -->
    <div class="mb-12">
        <Slider
            label="Volume"
            icon={volumeIcon}
            min={0}
            max={1}
            step={0.1}
            bind:value={settings.volume}
            onmouseup={() => {
                console.log("Volume changed to:", settings.volume);
                const startAudio = new Audio(startAudioFile);
                startAudio.volume = settings.volume;
                startAudio.play().catch((e) => {
                    console.error("Failed to play start audio:", e);
                });
            }}
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
    <!-- Blur -->
    <div class="mb-6">
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
