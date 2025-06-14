<script lang="ts">
    import {onMount} from 'svelte';
    import {goto} from '$app/navigation';
    import {invoke} from '@tauri-apps/api/core';
    import {load} from '@tauri-apps/plugin-store';
    import {stat} from '@tauri-apps/plugin-fs';
    import {sessionStore} from '$lib/globals.svelte';
    import MainMenuUI from './MainMenuUI.svelte';

    let folderErr = $state('');
    let showFolderErr = $state(false);
    let folderInfoMsg = $derived.by(() => {
        if (isLoadingImgs) return 'Loading images…';
        const nImgs = sessionStore.imgFiles.length;
        if (nImgs > 0) return `Found ${nImgs} image${nImgs > 1 ? 's' : ''}`;
        return '';
    });
    let isLoadingImgs = $state(false);
    let isValid = $derived.by(() => {
        return !isLoadingImgs && folderErr === '';
    });

    // Set the current folder and image files, along with any error messages.
    async function setImgFolder(folder: string) {
        showFolderErr = false;

        sessionStore.imgFolder = folder;
        const {files, err} = await getImgFiles(folder);
        sessionStore.imgFiles = files;
        folderErr = err as string;

        showFolderErr = true;
    }

    // Get all image files from the specified folder.
    async function getImgFiles(folder: string) {
        // Check if the folder is set
        if (folder === '') return {files: [], err: 'Please choose a folder'};
        // Check if the folder exists and is a directory
        try {
            const metadata = await stat(folder);
            if (!metadata.isDirectory) return {files: [], err: 'Path is not a folder'};
        } catch (err) {
            console.error('Error accessing folder:', err);
            return {files: [], err: 'Cannot access folder'};
        }

        // Load images from the folder
        isLoadingImgs = true;
        try {
            const files = await invoke('get_img_files', {dir: folder}) as string[];
            return {files: files, err: files.length === 0 ? 'No images found in folder' : ''};
        } catch (err) {
            console.error('Error loading images:', err);
            return {files: [], err};
        } finally {
            isLoadingImgs = false;
        }
    }

    async function startSession() {
        if (!isValid) return;
        // Save current session settings to persistent store
        const persistentStore = await load('store.json', {autoSave: false});
        await persistentStore.set('imgFolder', sessionStore.imgFolder);
        await persistentStore.set('imgFiles', sessionStore.imgFiles);
        await persistentStore.set('imgShowTime', sessionStore.imgShowTime);
        await persistentStore.save();
        goto('/session');
    }

    onMount(async () => {
        await setImgFolder(sessionStore.imgFolder);
        // Turn off the error message if no folder is set initially
        if (sessionStore.imgFolder === '') showFolderErr = false;
    });
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<MainMenuUI bind:imgShowTime={sessionStore.imgShowTime} bind:imgFolder={sessionStore.imgFolder}
            imgFiles={sessionStore.imgFiles}
            folderErr={showFolderErr ? folderErr : ''} {folderInfoMsg} {isLoadingImgs} {isValid}
            {setImgFolder} {startSession}/>
