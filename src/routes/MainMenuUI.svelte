<script lang="ts">
    import { slide } from "svelte-reduced-motion/transition";
    import { cubicOut } from "svelte/easing";
    import { Separator, Button, Checkbox, Label } from "bits-ui";
    import FolderInput from "$lib/components/FolderInput.svelte";
    import RadioButtons from "$lib/components/RadioButtons.svelte";
    import Background from "$lib/components/Background.svelte";
    import Card from "$lib/components/Card.svelte";
    import ImageGrid from "$lib/components/ImageGrid.svelte";
    import DurationField from "$lib/components/DurationField.svelte";
    import { sessionSettings, imgShowTimeOptions } from "$lib/store/session-settings.svelte";
    import SettingsButton from "$lib/components/SettingsButton.svelte";

    const APP_NAME = "SpeedSketch";
    const TAGLINE = "timed drawing sessions";
    const VERSION = "2.0.0";
    const COPYRIGHT = "© 2024–2025 Ava Pun";

    interface Props {
        imgUrls?: string[];
        folderErr?: string;
        isLoadingImgs?: boolean;
        isValid?: boolean;
        // Callback to be called when image folder is updated.
        setImgFolder?: (folder: string) => Promise<void>;
        startSession?: () => Promise<void>;
    }

    let {
        imgUrls = [],
        folderErr = "",
        isLoadingImgs = false,
        isValid = false,
        setImgFolder = async (_) => {
            console.warn("setImgFolder not implemented");
        },
        startSession = async () => {
            console.warn("startSession not implemented");
        },
    }: Props = $props();

    const imgShowTimeOptionsBind = imgShowTimeOptions.map((option) => ({
        label: option,
        value: option,
    }));
</script>

<div class="flex h-dvh items-center-safe justify-center-safe">
    <Background />
    <div class="w-lg">
        <header>
            <div class="mb-8 text-center text-shadow-sm">
                <h1 class="text-6xl font-thin">{APP_NAME}</h1>
                <Separator.Root class="divider text-muted mt-3 text-lg tracking-widest">
                    {TAGLINE}
                </Separator.Root>
            </div>
        </header>
        <main>
            <div class="mb-8 px-2">
                <ImageGrid {imgUrls} isLoading={isLoadingImgs} />
            </div>
            <Card class="mx-auto" cardBodyClass="p-0">
                <form>
                    <div class="p-8 pb-12">
                        <div class="mb-2">
                            <Label.Root class="text-muted" for="img-folder">
                                Image folder
                            </Label.Root>
                            <div class="float-end">
                                <Checkbox.Root
                                    id="include-subfolders"
                                    bind:checked={sessionSettings.includeSubfolders}
                                    onCheckedChange={(_) => setImgFolder(sessionSettings.imgFolder)}
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
                                <Checkbox.Root
                                    id="shuffle-images"
                                    bind:checked={sessionSettings.shuffleImgs}
                                    onCheckedChange={(_) => setImgFolder(sessionSettings.imgFolder)}
                                    class="checkbox checkbox-xs rounded-sm before:delay-0 before:duration-100"
                                    tabindex={0}
                                />
                                <Label.Root
                                    class="text-muted cursor-pointer text-xs"
                                    for="shuffle-images"
                                >
                                    Shuffle images
                                </Label.Root>
                            </div>
                        </div>
                        <FolderInput
                            id="img-folder"
                            class="mb-6 w-full"
                            bind:chosenFolder={sessionSettings.imgFolder}
                            callback={setImgFolder}
                            errorMsg={folderErr}
                            onkeydown={(e) => {
                                // Prevent form submission on Enter key press
                                if (e.key === "Enter") e.preventDefault();
                            }}
                        />
                        <RadioButtons
                            class="mb-4"
                            groupLabel="Time per image"
                            options={imgShowTimeOptionsBind}
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
                        disabled={!isValid}
                    >
                        <span class="iconify lucide--play"></span>Go!
                    </Button.Root>
                </form>
            </Card>
            <SettingsButton />
        </main>
        <footer class="text-muted mt-8 text-center">
            <small>v{VERSION} &nbsp; {COPYRIGHT}</small>
        </footer>
    </div>
</div>
