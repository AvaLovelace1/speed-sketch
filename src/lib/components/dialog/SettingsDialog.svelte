<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Select from "$lib/components/Select.svelte";
    import Slider from "$lib/components/Slider.svelte";
    import { appSettings } from "$lib/store/app-settings.svelte.js";
    import startAudioFile from "$lib/assets/audio/start.mp3";

    interface Props {
        onOpen?: () => void;
        onClose?: () => void;
    }

    let { onOpen = () => {}, onClose = () => {} }: Props = $props();

    let volumeIcon = $derived.by(() => {
        if (appSettings.volume === 0) return "lucide--volume-x";
        if (appSettings.volume < 0.5) return "lucide--volume-1";
        return "lucide--volume-2";
    });
    let dialog: Dialog;

    async function onCloseWithSave() {
        await appSettings.saveToStore();
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
            await appSettings.saveToStore();
            fn();
        });
    }
</script>

<Dialog bind:this={dialog} title="Settings" {onOpen} onClose={onCloseWithSave}>
    <!-- Theme picker -->
    <div class="mb-4">
        <Select
            label="Theme"
            bind:value={appSettings.theme}
            items={new Map(
                appSettings.THEMES.map((t) => [
                    t.name,
                    { value: t.name, label: t.label, icon: t.icon },
                ]),
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
            bind:value={appSettings.volume}
            onmouseup={() => {
                const startAudio = new Audio(startAudioFile);
                startAudio.volume = appSettings.volume;
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
            max={appSettings.CONTRAST_OPTIONS.length - 1}
            step={1}
            bind:value={appSettings.contrastStrength}
        />
    </div>
    <!-- Blur -->
    <div class="mb-6">
        <Slider
            label="Blur strength"
            icon="lucide--droplet"
            min={0}
            max={appSettings.BLUR_OPTIONS.length - 1}
            step={1}
            bind:value={appSettings.blurStrength}
        />
    </div>
</Dialog>
