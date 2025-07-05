<script lang="ts">
    import { slide } from "svelte-reduced-motion/transition";
    import { cubicOut } from "svelte/easing";
    import { Separator, Button, Label, Checkbox } from "bits-ui";
    import type { Image } from "$lib/types.svelte";
    import Background from "$lib/components/Background.svelte";
    import Card from "$lib/components/Card.svelte";
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
    <Background />
    <div class="w-lg py-8">
        <header>
            <div class="mb-8 text-center text-shadow-sm">
                <h1 class="text-6xl font-thin">{APP_NAME}</h1>
                <Separator.Root class="divider text-muted mt-3 text-lg tracking-widest">
                    {TAGLINE}
                </Separator.Root>
            </div>
        </header>
        <main>
            <Card class="mx-auto" cardBodyClass="p-0">
                <form>
                    <div class="p-8 pb-12">
                        <div class="mb-2">
                            <Label.Root class="text-muted" for="images-input">Images</Label.Root>
                            <div class="float-end">
                                {#if isTauri()}
                                    <Checkbox.Root
                                        id="include-subfolders"
                                        bind:checked={sessionSettings.includeSubfolders}
                                        onCheckedChange={async (_) => {
                                            await onImagesInput(null);
                                        }}
                                        class="checkbox checkbox-xs rounded-sm before:delay-0 before:duration-100"
                                        tabindex={0}
                                    />
                                    <Label.Root
                                        class="text-muted cursor-pointer text-xs"
                                        for="include-subfolders"
                                    >
                                        Include subfolders
                                    </Label.Root>
                                    &nbsp;&nbsp;
                                {/if}
                                <Checkbox.Root
                                    id="shuffle-images"
                                    bind:checked={sessionSettings.shuffleImgs}
                                    onCheckedChange={async (_) => {
                                        await onImagesInput(null);
                                    }}
                                    class="checkbox checkbox-xs rounded-sm before:delay-0 before:duration-100"
                                    tabindex={0}
                                />
                                <Label.Root
                                    class="text-muted cursor-pointer text-xs"
                                    for="shuffle-images"
                                >
                                    Shuffle
                                </Label.Root>
                            </div>
                        </div>
                        <div class="mb-6">
                            <ImagesInput
                                class="text-center"
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
                                        </span>
                                        {sessionSettings.imgFolder}
                                    </p>
                                {/if}
                                {#if isLoadingImgs || imgs.length > 0}
                                    <div class="mx-auto mb-6 w-xs">
                                        <ImageGrid
                                            {imgs}
                                            isLoading={isLoadingImgs}
                                            maxImgs={8}
                                            gridClass="grid-cols-4 gap-1"
                                        ></ImageGrid>
                                    </div>
                                    <p class="text-center text-xs font-semibold">
                                        Drag & drop or click to choose another folder
                                    </p>
                                {:else if imgErrMsg}
                                    <p
                                        role="status"
                                        aria-label="Error"
                                        class="text-error mb-4 text-base font-semibold"
                                    >
                                        <span class="iconify lucide--octagon-x align-text-bottom"
                                        ></span>
                                        {imgErrMsg}
                                    </p>
                                    <p class="text-center text-xs font-semibold">
                                        Drag & drop or click to choose another folder
                                    </p>
                                {:else}
                                    <p class="text-center">
                                        <span class="iconify lucide--download text-lg"></span>
                                    </p>
                                    <p class="text-center font-semibold">
                                        Drag & drop or click to choose a folder
                                    </p>
                                {/if}
                                {#if !isTauri()}
                                    <p class="text-center">
                                        <small>
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
        <footer class="text-muted mt-8 text-center text-sm">
            <p>
                <a
                    href={GITHUB_URL}
                    class="hover:text-primary focus-visible:text-primary active:text-base-content hover:underline focus-visible:underline"
                    target="_blank"
                    rel="noreferrer"
                    tabindex="0"
                >
                    <span class="font-semibold">star us on GitHub</span>
                    <span class="iconify lucide--external-link align-text-bottom">
                        <span class="sr-only">Opens in new tab</span>
                    </span>
                </a>
                &nbsp;•&nbsp;
                <a
                    href={ISSUE_URL}
                    class="hover:text-primary focus-visible:text-primary active:text-base-content hover:underline focus-visible:underline"
                    target="_blank"
                    rel="noreferrer"
                    tabindex="0"
                >
                    <span class="font-semibold">report an issue</span>
                    <span class="iconify lucide--external-link align-text-bottom">
                        <span class="sr-only">Opens in new tab</span>
                    </span>
                </a>
            </p>
            <p>
                <small>{COPYRIGHT} &nbsp;•&nbsp; v{VERSION}</small>
            </p>
        </footer>
        <SettingsButton />
    </div>
</div>
