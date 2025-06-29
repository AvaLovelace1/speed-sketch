<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { invoke, convertFileSrc } from "@tauri-apps/api/core";
    import { stat } from "@tauri-apps/plugin-fs";
    import MainMenuUI from "./MainMenuUI.svelte";
    import startAudioFile from "$lib/assets/audio/start.wav";
    import { appSettings } from "$lib/store/app-settings.svelte";
    import { type Image } from "$lib/types.svelte";
    import { DrawingSession, currentSession } from "$lib/drawing-session.svelte";
    import { sessionSettings } from "$lib/store/session-settings.svelte";

    let folderErr = $state("");
    let showFolderErr = $state(false);
    let isLoadingImgs = $state(false);
    let folderImgs = $state<Image[]>([]);
    const isValid = $derived.by(() => {
        return !isLoadingImgs && folderErr === "";
    });

    // Set the current folder and image paths, along with any error messages.
    async function setImgFolder(folder: string) {
        showFolderErr = false;

        sessionSettings.imgFolder = folder;
        const { imgs, err } = await getImgs(folder);
        if (sessionSettings.imgFolder != folder) {
            // If the folder has changed while loading, ignore the result
            return;
        }
        folderImgs = imgs;
        folderErr = err as string;

        showFolderErr = true;
    }

    // Get all image paths from the specified folder, converted to path URLs.
    async function getImgs(folder: string) {
        // Check if the folder is set
        if (folder === "") return { imgs: [], err: "Please choose a folder" };
        // Check if the folder exists and is a directory
        try {
            const metadata = await stat(folder);
            if (!metadata.isDirectory) return { imgs: [], err: "Path is not a folder" };
        } catch (err) {
            console.error("Error accessing folder:", err);
            return { imgs: [], err: "Cannot access folder" };
        }

        // Load images from the folder
        isLoadingImgs = true;
        try {
            const files = (await invoke("get_img_files", {
                dir: folder,
                includeSubdirs: sessionSettings.includeSubfolders,
                shuffle: sessionSettings.shuffleImgs,
                timeoutDuration: 60,
            })) as string[];
            const imgs = files.map((file) => ({ url: convertFileSrc(file), path: file }));
            return { imgs, err: imgs.length === 0 ? "No images found in folder" : "" };
        } catch (err) {
            console.error("Error loading images:", err);
            if (err === "TimeoutError") return { imgs: [], err: "Loading images timed out" };
            if (err === "TaskJoinError") return { imgs: [], err: "Failed to load images" };
            return { imgs: [], err };
        } finally {
            isLoadingImgs = false;
        }
    }

    async function startSession() {
        if (!isValid) return;

        const startAudio = new Audio(startAudioFile);
        startAudio.volume = appSettings.volume;
        await startAudio.play().catch((e) => {
            console.error("Failed to play start audio:", e);
        });

        await sessionSettings.saveToStore();

        currentSession.object = new DrawingSession(folderImgs, sessionSettings.imgShowTime);
        goto("/session");
    }

    onMount(async () => {
        await setImgFolder(sessionSettings.imgFolder);
        // Turn off the error message if no folder is set initially
        if (sessionSettings.imgFolder === "") showFolderErr = false;
    });
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<MainMenuUI
    imgUrls={folderImgs.map((img) => img.url)}
    folderErr={showFolderErr ? folderErr : ""}
    {isLoadingImgs}
    {isValid}
    {setImgFolder}
    {startSession}
/>
