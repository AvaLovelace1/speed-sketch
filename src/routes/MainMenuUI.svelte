<script lang="ts">
    import { slide } from "svelte-reduced-motion/transition";
    import { cubicOut } from "svelte/easing";
    import { Separator, Button } from "bits-ui";
    import { appName, tagline } from "$lib/globals.svelte";
    import FolderInput from "$lib/components/FolderInput.svelte";
    import RadioButtons from "$lib/components/RadioButtons.svelte";
    import Background from "$lib/components/Background.svelte";
    import Card from "$lib/components/Card.svelte";
    import ImageGrid from "$lib/components/ImageGrid.svelte";
    import DurationField from "$lib/components/DurationField.svelte";
    import { imgShowTimeOptions } from "$lib/session-settings.svelte";
    import SettingsButton from "$lib/components/SettingsButton.svelte";

    interface Props {
        // The selected image show time as a string, or "Custom".
        imgShowTimeOption: string;
        // The value of the custom image show time in seconds.
        imgShowTimeCustom: number;
        imgFolder?: string;
        imgUrls?: string[];
        folderErr?: string;
        isLoadingImgs?: boolean;
        isValid?: boolean;
        setImgFolder?: (folder: string) => Promise<void>;
        startSession?: () => Promise<void>;
    }

    let {
        imgShowTimeOption = $bindable(),
        imgShowTimeCustom = $bindable(),
        imgFolder = $bindable(""),
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

<main class="flex h-dvh items-center-safe justify-center-safe">
    <Background />
    <div class="w-lg">
        <div class="mb-8 text-center text-shadow-sm">
            <h1 class="text-6xl font-thin">{appName}</h1>
            <Separator.Root class="divider mt-3 text-lg">
                <span class="text-muted tracking-widest">{tagline}</span>
            </Separator.Root>
        </div>
        <div class="mb-8 px-2">
            <ImageGrid {imgUrls} isLoading={isLoadingImgs} />
        </div>
        <Card class="mx-auto" cardBodyClass="p-0">
            <form>
                <div class="p-8 pb-12">
                    <FolderInput
                        class="mb-4 w-full"
                        label="Image folder"
                        bind:chosenFolder={imgFolder}
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
                        bind:group={imgShowTimeOption}
                    />
                    {#if imgShowTimeOption === "Custom"}
                        <div
                            class="flex justify-center"
                            transition:slide={{ duration: 250, easing: cubicOut }}
                        >
                            <DurationField bind:seconds={imgShowTimeCustom} />
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
    </div>
    <SettingsButton />
</main>
