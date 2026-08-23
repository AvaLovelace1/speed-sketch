<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Select from "$lib/components/input/Select.svelte";
    import Slider from "$lib/components/input/Slider.svelte";
    import { AppSettings } from "$lib/store/app-settings.svelte";
    import { playStartAudio } from "$lib/audio";
    import { Label, Separator } from "bits-ui";
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

    const sectionHeadingClass = "mb-4 text-xs font-semibold tracking-wider uppercase";
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
    <!-- Global settings -->
    <section>
        <h3 class={sectionHeadingClass}>Global</h3>
        <!-- Theme picker -->
        <div class="mb-4">
            <Select
                label="Theme"
                bind:value={appSettings.theme}
                items={AppSettings.THEMES.map((t) => ({
                    value: t.name,
                    label: t.label,
                    icon: t.icon,
                }))}
            />
        </div>
        <!-- Volume -->
        <div>
            <!-- Pad value with figure spaces so slider length doesn't shift -->
            <Slider
                label="Volume"
                icon={volumeIcon}
                min={0}
                max={1}
                step={0.1}
                bind:value={appSettings.volume}
                formatValue={(v) =>
                    `${Math.round(v * 100)
                        .toString()
                        .padStart(3, "\u2007")}%`}
                onmouseup={playStartAudio}
            />
        </div>
    </section>

    <Separator.Root class="divider" />

    <!-- Drawing session settings -->
    <section>
        <h3 class={sectionHeadingClass}>Session</h3>
        <!-- Contrast -->
        <div class="mb-6">
            <Slider
                label="Contrast filter strength"
                icon="lucide--contrast"
                min={0}
                max={AppSettings.CONTRAST_OPTIONS.length - 1}
                step={1}
                bind:value={appSettings.contrastStrength}
                formatValue={(v) => (v + 1).toString()}
            />
        </div>
        <!-- Blur -->
        <div class="mb-6">
            <Slider
                label="Blur strength"
                icon="lucide--droplet"
                min={0}
                max={AppSettings.BLUR_OPTIONS.length - 1}
                step={1}
                bind:value={appSettings.blurStrength}
                formatValue={(v) => (v + 1).toString()}
            />
        </div>
        <!-- Video playback speed -->
        <div class="mb-6">
            <Slider
                label="Video playback speed"
                icon="lucide--circle-gauge"
                min={AppSettings.MIN_VIDEO_PLAYBACK_RATE}
                max={AppSettings.MAX_VIDEO_PLAYBACK_RATE}
                step={AppSettings.VIDEO_PLAYBACK_RATE_STEP}
                bind:value={appSettings.videoPlaybackRate}
                formatValue={(v) => `${v.toFixed(2)}×`}
            />
        </div>
        <!-- Grid dimensions -->
        <div>
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
    </section>
</Dialog>
