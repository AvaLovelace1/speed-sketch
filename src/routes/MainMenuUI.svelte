<script lang="ts">
    import { Separator } from "bits-ui";
    import { appName, imgShowTimes, tagline } from "$lib/globals.svelte";
    import FolderInput from "./FolderInput.svelte";
    import RadioButtons from "./RadioButtons.svelte";
    import { formatTimeHuman } from "$lib/utils.svelte";
    import Card from "$lib/components/Card.svelte";

    interface Props {
        imgShowTime: number;
        imgFolder: string;
        imgPaths: string[];
        folderErr: string;
        folderInfoMsg: string;
        isLoadingImgs: boolean;
        isValid: boolean;
        setImgFolder: (folder: string) => Promise<void>;
        startSession: () => Promise<void>;
    }

    let {
        imgShowTime = $bindable(),
        imgFolder = $bindable(),
        imgPaths,
        folderErr,
        folderInfoMsg,
        isLoadingImgs,
        isValid,
        setImgFolder,
        startSession,
    }: Props = $props();

    const imgShowTimeOptions = imgShowTimes.map((seconds) => ({
        label: formatTimeHuman(seconds),
        value: seconds,
    }));
</script>

<div class="bg-primary fixed inset-0"></div>
<!-- Background overlay -->
<div class="flex min-h-dvh items-center justify-center">
    <Card>
        <h1 class="card-title self-center text-5xl font-extralight">{appName}</h1>
        <Separator.Root class="divider mt-1 mb-5 text-lg">
            <span class="italic opacity-50">{tagline}</span>
        </Separator.Root>
        <form class="grid gap-3">
            <FolderInput
                bind:chosenFolder={imgFolder}
                callback={setImgFolder}
                errorMsg={folderErr}
                infoMsg={folderInfoMsg}
            />
            {#if isLoadingImgs}
                <div class="-mt-1 h-16 opacity-50"></div>
            {:else if imgPaths.length > 0}
                <div class="-mt-1 grid grid-cols-5 gap-1">
                    {#each { length: Math.min(imgPaths.length, 5) } as _, i (i)}
                        <img
                            src={imgPaths[i]}
                            alt="Preview {i}"
                            class="h-16 w-16 rounded object-cover"
                        />
                    {/each}
                </div>
            {/if}
            <RadioButtons
                name="imgShowTime"
                options={imgShowTimeOptions}
                bind:group={imgShowTime}
            />
            <button
                type="submit"
                class="btn btn-success btn-block"
                onclick={startSession}
                disabled={!isValid}
            >
                <span class="iconify lucide--play"></span>Go!
            </button>
        </form>
    </Card>
</div>
