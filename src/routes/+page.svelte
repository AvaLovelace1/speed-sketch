<script lang="ts">
    import {onMount} from 'svelte';
    import {goto} from '$app/navigation';
    import {invoke} from '@tauri-apps/api/core';
    import {load} from '@tauri-apps/plugin-store';
    import {sessionStore} from '$lib/globals.svelte';
    import MainMenuUI from './MainMenuUI.svelte';

    let isLoadingImgs = $state(true);

    let folderError = $derived.by(() => {
        if (isLoadingImgs) return '';
        if (sessionStore.imgFolder === '') return 'Please choose a folder';
        if (sessionStore.imgFiles.length === 0) return 'No images found in folder';
        return '';
    });
    let showFolderError = $state(false);
    let folderInfoMsg = $derived.by(() => {
        if (isLoadingImgs) return 'Loading images…';
        if (sessionStore.imgFiles.length > 0) return `Found ${sessionStore.imgFiles.length} images`;
        return '';
    });
    let isValid = $derived.by(() => {
        return !isLoadingImgs && folderError === '';
    });

    async function setImgFolder(folder: string) {
        sessionStore.imgFolder = folder;
        await getImgFiles();
        showFolderError = true;
    }

    async function getImgFiles() {
        if (sessionStore.imgFolder) {
            isLoadingImgs = true;
            sessionStore.imgFiles = await invoke('get_img_paths', {dir: sessionStore.imgFolder});
            isLoadingImgs = false;
            showFolderError = true;
        } else {
            sessionStore.imgFiles = [];
        }
    }

    async function startSession() {
        if (!isValid) return;
        const persistentStore = await load('store.json', {autoSave: false});
        await persistentStore.set('imgFolder', sessionStore.imgFolder);
        await persistentStore.set('imgFiles', sessionStore.imgFiles);
        await persistentStore.set('imgShowTime', sessionStore.imgShowTime);
        await persistentStore.save();
        goto('/session');
    }

    onMount(() => {
        getImgFiles();
    });
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<MainMenuUI bind:imgShowTime={sessionStore.imgShowTime} bind:imgFolder={sessionStore.imgFolder}
            imgFiles={sessionStore.imgFiles}
            folderError={showFolderError ? folderError : ''} {folderInfoMsg} {isLoadingImgs} {isValid}
            {setImgFolder} {startSession}/>
