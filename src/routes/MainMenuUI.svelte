<script lang="ts">
    import { convertFileSrc } from '@tauri-apps/api/core';
    import { Separator } from 'bits-ui';
    import { appName, imgShowTimes, tagline } from '$lib/globals.svelte';
    import FolderInput from './FolderInput.svelte';
    import RadioButtons from './RadioButtons.svelte';

    interface Props {
        imgShowTime: number;
        imgFolder: string;
        imgFiles: string[];
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
        imgFiles,
        folderErr,
        folderInfoMsg,
        isLoadingImgs,
        isValid,
        setImgFolder,
        startSession,
    }: Props = $props();

    const imgShowTimeOptions = imgShowTimes.map((seconds) => ({
        label: formatShowTime(seconds),
        value: seconds,
    }));

    function formatShowTime(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return (minutes ? `${minutes}m` : '') + (secs ? `${secs}s` : '');
    }
</script>

<div class="bg-primary fixed inset-0"></div>
<!-- Background overlay -->
<div class="flex min-h-dvh flex-col items-center justify-center">
    <div class="card bg-base-100 w-fit shadow-sm">
        <div class="card-body items-center">
            <h1 class="card-title text-5xl font-thin">{appName}</h1>
            <Separator.Root class="divider mt-1 mb-5 text-lg font-light">
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
                {:else if imgFiles.length > 0}
                    <div class="-mt-1 grid grid-cols-5 gap-1">
                        {#each { length: Math.min(imgFiles.length, 5) } as _, i (i)}
                            <img
                                src={convertFileSrc(imgFiles[i])}
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
                    <span class="iconify lucide--play"></span>GO!
                </button>
            </form>
        </div>
    </div>
</div>
