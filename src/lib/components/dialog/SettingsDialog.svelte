<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Select from "$lib/components/input/Select.svelte";
    import Slider from "$lib/components/input/Slider.svelte";
    import { AppSettings } from "$lib/store/app-settings.svelte.js";
    import { playStartAudio } from "$lib/audio";
    import { Label } from "bits-ui";
    import NumberField from "$lib/components/input/NumberField.svelte";

    export interface Props {
        appSettings: AppSettings;
        onOpen?: () => void;
        onClose?: () => void;
    }

    let { appSettings, onOpen = () => {}, onClose = () => {} }: Props = $props();

    let volumeIcon = $derived.by(() => {
        if (appSettings.volume === 0) return "lucide--volume-x";
        if (appSettings.volume < 0.5) return "lucide--volume-1";
        return "lucide--volume-2";
    });
    let dialog: Dialog;

    export function open() {
        dialog.open();
    }

    export function setOnOpen(fn: () => void) {
        onOpen = fn;
    }

    export function setOnClose(fn: () => void) {
        onClose = fn;
    }
</script>

<Dialog
    bind:this={dialog}
    title="Settings"
    {onOpen}
    onClose={async () => {
        await appSettings.saveToStore();
        onClose();
    }}
>
    <!-- Theme picker -->
    <div class="mb-6">
        <Select
            label="Theme"
            bind:value={appSettings.theme}
            items={appSettings.THEMES.map((t) => ({ value: t.name, label: t.label, icon: t.icon }))}
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
            onmouseup={playStartAudio}
        />
    </div>
    <!-- Contrast -->
    <div class="mb-6">
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
    <!-- Grid dimensions -->
    <div class="mb-4">
        <div class="mb-2 cursor-default text-sm text-muted">Grid dimensions (rows × cols)</div>
        <div class="flex items-center gap-2">
            <Label.Root for="gridRowsField" class="flex items-center">
                <span class="iconify text-stroke lucide--grid"></span>
                <span class="sr-only">Grid rows</span>
            </Label.Root>
            <div>
                <NumberField
                    id="gridRowsField"
                    minValue={1}
                    maxValue={99}
                    bind:value={appSettings.gridRows}
                />
                <span class="text-xl text-muted">×</span>
                <Label.Root for="gridColsField" class="sr-only">Grid columns</Label.Root>
                <NumberField
                    id="gridColsField"
                    minValue={1}
                    maxValue={99}
                    bind:value={appSettings.gridCols}
                />
            </div>
        </div>
    </div>
</Dialog>
