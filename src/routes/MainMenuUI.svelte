<script lang="ts">
    import { slide } from "svelte-reduced-motion/transition";
    import { cubicOut } from "svelte/easing";
    import { Separator, Button, Label } from "bits-ui";
    import type { Image } from "$lib/types.svelte";
    import Card from "$lib/components/Card.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
    import DurationField from "$lib/components/DurationField.svelte";
    import ImageGrid from "$lib/components/ImageGrid.svelte";
    import ImagesInput from "$lib/components/ImagesInput.svelte";
    import RadioButtons from "$lib/components/RadioButtons.svelte";
    import SettingsButton from "$lib/components/SettingsButton.svelte";
    import { sessionSettings } from "$lib/store/session-settings.svelte";
    import { isTauri } from "@tauri-apps/api/core";

    const APP_NAME = "SpeedSketch";
    const TAGLINE = "timed drawing sessions";
    const VERSION = "2.0.0";
    const COPYRIGHT = "© 2024–2025 Ava Pun";
    const GITHUB_URL = "https://github.com/AvaLovelace1/speed-sketch";
    const ISSUE_URL = `${GITHUB_URL}/issues/new`;
    const BUG_REPORT_URL = `${ISSUE_URL}?template=bug_report.md`;
    const FEATURE_REQUEST_URL = `${ISSUE_URL}?template=feature_request.md`;
    const IMG_SHOW_TIME_OPTIONS = sessionSettings.IMG_SHOW_TIME_OPTIONS.map((option) => ({
        label: option,
        value: option,
    }));

    interface Props {
        imgs?: Image[];
        imgErrMsg?: string;
        isLoadingImgs?: boolean;
        canStartSession?: boolean;
        setLoadingImgs?: (value: boolean) => void;
        // Callback to be called when image input is updated
        onImagesInput?: (inputImgsOrFolder: string | Image[] | null) => Promise<void>;
        startSession?: () => Promise<void>;
    }

    let {
        imgs = [],
        imgErrMsg = "",
        isLoadingImgs = false,
        canStartSession = false,
        setLoadingImgs = (_) => {},
        onImagesInput = async (_) => {},
        startSession = async () => {},
    }: Props = $props();
</script>

<div class="flex h-dvh items-center-safe justify-center-safe">
    <div class="w-lg py-8">
        <header class="mb-8 text-center">
            <h1 class="text-6xl font-thin">{APP_NAME}</h1>
            <Separator.Root class="divider text-muted mt-3 text-lg tracking-widest">
                {TAGLINE}
            </Separator.Root>
        </header>
        <main class="mb-8">
            <Card class="mx-auto">
                <form>
                    <div class="p-8 pb-12">
                        <div class="mb-6">
                            <div class="mb-2 flex items-baseline justify-between">
                                <Label.Root class="text-muted text-sm" for="images-input">
                                    Images
                                </Label.Root>
                                <div class="flex gap-3">
                                    {#if isTauri()}
                                        <Checkbox
                                            label="Include subfolders"
                                            bind:checked={sessionSettings.includeSubfolders}
                                            onCheckedChange={async (_) => await onImagesInput(null)}
                                        />
                                    {/if}
                                    <Checkbox
                                        label="Shuffle"
                                        bind:checked={sessionSettings.shuffleImgs}
                                        onCheckedChange={async (_) => await onImagesInput(null)}
                                    />
                                </div>
                            </div>
                            <ImagesInput
                                id="images-input"
                                onFileDropped={() => setLoadingImgs(true)}
                                onFileDialogCancel={() => setLoadingImgs(false)}
                                {onImagesInput}
                            >
                                {#if sessionSettings.imgFolder}
                                    <p
                                        class={[
                                            "text-base-content mx-auto mb-3 w-xs text-center",
                                            imgErrMsg ? "text-error" : "",
                                        ]}
                                    >
                                        <span
                                            class="iconify lucide--folder text-muted align-text-bottom"
                                        >
                                            <span class="sr-only">Folder</span>
                                        </span>
                                        {sessionSettings.imgFolder}
                                    </p>
                                {/if}
                                {#if isLoadingImgs || imgs.length > 0}
                                    <div class="mx-auto mt-3 mb-6 w-xs">
                                        <ImageGrid
                                            {imgs}
                                            isLoading={isLoadingImgs}
                                            maxImgs={8}
                                            gridClass="grid-cols-4 gap-1"
                                        ></ImageGrid>
                                    </div>
                                    <p class="text-sm font-semibold">
                                        Drag & drop or click to choose another folder
                                    </p>
                                {:else if imgErrMsg}
                                    <p role="status" class="text-error mb-4 text-xl font-semibold">
                                        <span class="iconify lucide--octagon-x align-text-bottom">
                                            <span class="sr-only">Error</span>
                                        </span>
                                        {imgErrMsg}
                                    </p>
                                    <p class="text-sm font-semibold">
                                        Drag & drop or click to choose another folder
                                    </p>
                                {:else}
                                    <span class="iconify lucide--download text-xl"></span>
                                    <p class="text-sm font-semibold">
                                        Drag & drop or click to choose folder
                                    </p>
                                {/if}
                                {#if !isTauri()}
                                    <p class="text-center">
                                        <small class="text-xs">
                                            Images are stored locally and will <strong>not</strong> be
                                            uploaded.
                                        </small>
                                    </p>
                                {/if}
                            </ImagesInput>
                        </div>
                        <RadioButtons
                            class="mb-4"
                            groupLabel="Time per image"
                            options={IMG_SHOW_TIME_OPTIONS}
                            bind:group={sessionSettings.imgShowTimeOption}
                        />
                        {#if sessionSettings.imgShowTimeOption === "Custom"}
                            <div
                                class="flex justify-center"
                                transition:slide={{ duration: 250, easing: cubicOut }}
                            >
                                <DurationField bind:seconds={sessionSettings.imgShowTimeCustom} />
                            </div>
                        {/if}
                    </div>
                    <Button.Root
                        type="submit"
                        class="btn btn-success btn-block rounded-b-box rounded-t-none p-6 text-lg font-semibold uppercase"
                        onclick={startSession}
                        disabled={!canStartSession}
                    >
                        <span class="iconify lucide--play"></span>Go!
                    </Button.Root>
                </form>
            </Card>
        </main>
        <footer class="text-muted text-center text-sm">
            <p>
                <a
                    href={BUG_REPORT_URL}
                    class="hover:text-primary focus-visible:text-primary active:text-base-content hover:underline focus-visible:underline"
                    target="_blank"
                    rel="noreferrer"
                    tabindex="0"
                >
                    report <strong class="font-semibold">bug</strong>
                    <span class="iconify lucide--external-link align-text-bottom">
                        <span class="sr-only">(Opens in new tab)</span>
                    </span>
                </a>
                &nbsp;•&nbsp;
                <a
                    href={FEATURE_REQUEST_URL}
                    class="hover:text-primary focus-visible:text-primary active:text-base-content hover:underline focus-visible:underline"
                    target="_blank"
                    rel="noreferrer"
                    tabindex="0"
                >
                    request <strong class="font-semibold">feature</strong>
                    <span class="iconify lucide--external-link align-text-bottom">
                        <span class="sr-only">(Opens in new tab)</span>
                    </span>
                </a>
            </p>
            <p>
                <small class="text-xxs">{COPYRIGHT} &nbsp;•&nbsp; v{VERSION}</small>
            </p>
        </footer>
        <SettingsButton />
    </div>
</div>
