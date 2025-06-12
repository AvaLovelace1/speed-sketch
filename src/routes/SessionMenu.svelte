<script lang="ts">
    import {goto} from '$app/navigation';
    import {convertFileSrc, invoke} from '@tauri-apps/api/core';
    import {load} from '@tauri-apps/plugin-store';
    import {sessionStore} from '$lib/globals.svelte';
    import FolderInput from './FolderInput.svelte';
    import RadioButtons from './RadioButtons.svelte';

    interface Props {
        title?: string;
        subtitle?: string;
        imgShowTimes?: number[];
    }

    const {
        title = 'SpeedSketch',
        subtitle = 'timed drawing sessions',
        imgShowTimes = [30, 45, 60, 120, 300, 600],
    }: Props = $props();

    function getLabel(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return (minutes ? `${minutes}m` : '') + (secs ? `${secs}s` : '');
    }

    const imgShowTimeOptions = imgShowTimes.map(seconds => ({label: getLabel(seconds), value: seconds}));

    let folderError = $derived.by(() => {
        if (sessionStore.imgFolder === '') {
            return 'Please choose a folder';
        }
        if (sessionStore.imgFiles.length === 0) {
            return 'No images found in folder';
        }
        return '';
    });
    let showFolderError = $state(false);
    let folderInfoMsg = $derived.by(() => {
        if (sessionStore.imgFiles.length > 0) {
            return `Found ${sessionStore.imgFiles.length} images`;
        }
        return '';
    });
    let isValid = $derived.by(() => {
        return folderError === '';
    });

    async function setImgFolder(folder: string) {
        sessionStore.imgFolder = folder;
        await getImgFiles();
        showFolderError = true;
    }

    async function getImgFiles() {
        if (sessionStore.imgFolder) {
            sessionStore.imgFiles = await invoke('get_img_paths', {dir: sessionStore.imgFolder});
            showFolderError = true;
        } else {
            sessionStore.imgFiles = [];
        }
    }
    getImgFiles();

    async function handleSubmit() {
        if (!isValid) return;
        const persistentStore = await load('store.json', {autoSave: false});
        await persistentStore.set('imgFolder', sessionStore.imgFolder);
        await persistentStore.set('imgFiles', sessionStore.imgFiles);
        await persistentStore.set('imgShowTime', sessionStore.imgShowTime);
        await persistentStore.save();
        goto('/session');
    }
</script>

<div class="card w-fit bg-base-100 shadow-sm">
    <div class="card-body items-center">
        <h1 class="card-title text-5xl font-thin">{title}</h1>
        <div class="divider text-lg mt-1 mb-5 font-light">
            <span class="opacity-50"><em>{subtitle}</em></span>
        </div>
        <form class="grid gap-3">
            <FolderInput bind:chosenFolder={sessionStore.imgFolder} callback={setImgFolder}
                         errorMsg={showFolderError ? folderError : ''} infoMsg={folderInfoMsg}/>
            {#if sessionStore.imgFiles.length > 0}
                <div class="-mt-1 grid grid-cols-5 gap-1">
                    {#each {length: Math.min(sessionStore.imgFiles.length, 5)} as _, i}
                        <img src={convertFileSrc(sessionStore.imgFiles[i])} alt="Preview {i}"
                             class="w-16 h-16 object-cover rounded"/>
                    {/each}
                </div>
            {/if}
            <RadioButtons name="imgShowTime" options={imgShowTimeOptions} bind:group={sessionStore.imgShowTime}/>
            <button type="submit" class="btn btn-success btn-block" onclick={handleSubmit} disabled={!isValid}>
                GO!
            </button>
        </form>
    </div>
</div>
