<script lang="ts">
    import { Separator, Button } from "bits-ui";
    import { appName, imgShowTimes, tagline } from "$lib/globals.svelte";
    import FolderInput from "./FolderInput.svelte";
    import RadioButtons from "./RadioButtons.svelte";
    import prettyMilliseconds from "pretty-ms";
    import Card from "$lib/components/Card.svelte";
    import ImageGrid from "./ImageGrid.svelte";

    interface Props {
        imgShowTime: number;
        imgFolder?: string;
        imgPaths?: string[];
        folderErr?: string;
        isLoadingImgs?: boolean;
        isValid?: boolean;
        setImgFolder?: (folder: string) => Promise<void>;
        startSession?: () => Promise<void>;
    }

    let {
        imgShowTime = $bindable(),
        imgFolder = $bindable(""),
        imgPaths = [],
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

    const imgShowTimeOptions = imgShowTimes
        .map((seconds) => ({
            label: prettyMilliseconds(seconds * 1000),
            value: seconds.toString(),
        }))
        .concat([{ label: "Custom", value: "custom" }]);

    let imgShowTimeSelected = $state(imgShowTimeOptions[0].value);

    function imgShowTimeOnValueChange(value: string) {
        imgShowTime = value === "custom" ? 42 : parseInt(value, 10);
    }
</script>

<main class="bg-base-100 flex min-h-dvh items-center justify-center bg-(image:--fx-noise)">
    <div class="w-lg">
        <div class="mb-10 text-center text-shadow-sm">
            <h1 class="text-6xl font-thin">{appName}</h1>
            <Separator.Root class="divider mt-3 text-lg">
                <span class="text-muted tracking-widest">{tagline}</span>
            </Separator.Root>
        </div>
        <div class="mb-8 px-2">
            <ImageGrid {imgPaths} isLoading={isLoadingImgs} />
        </div>
        <Card class="mx-auto" cardBodyClass="p-0">
            <form>
                <div class="mb-6 space-y-6 p-6">
                    <FolderInput
                        class="w-full"
                        label="Image folder"
                        bind:chosenFolder={imgFolder}
                        callback={setImgFolder}
                        errorMsg={folderErr}
                    />
                    <div class="space-y-2">
                        <RadioButtons
                            groupLabel="Time per image"
                            options={imgShowTimeOptions}
                            bind:group={imgShowTimeSelected}
                            onValueChange={imgShowTimeOnValueChange}
                        />
                        {#if imgShowTimeSelected === "custom"}
                            <div>Custom time {imgShowTime}</div>
                        {/if}
                    </div>
                </div>
                <Button.Root
                    type="submit"
                    class="btn btn-success btn-block rounded-b-box rounded-t-none p-6 text-lg font-bold uppercase"
                    onclick={startSession}
                    disabled={!isValid}
                >
                    <span class="iconify lucide--play"></span>Go!
                </Button.Root>
            </form>
        </Card>
    </div>
</main>
