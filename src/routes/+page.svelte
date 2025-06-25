<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { invoke, convertFileSrc } from "@tauri-apps/api/core";
    import { load } from "@tauri-apps/plugin-store";
    import { stat } from "@tauri-apps/plugin-fs";
    import { sessionStore } from "$lib/globals.svelte";
    import MainMenuUI from "./MainMenuUI.svelte";
    import startAudioFile from "$lib/assets/audio/start.wav";
    import { appSettings } from "$lib/app-settings.svelte";
    import { sessionSettings } from "$lib/session-settings.svelte";

    let folderErr = $state("");
    let showFolderErr = $state(false);
    let isLoadingImgs = $state(false);
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
        sessionStore.imgs = imgs;
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

        sessionStore.imgShowTime =
            sessionSettings.imgShowTimeSelected === "custom"
                ? sessionSettings.imgShowTimeCustom
                : parseInt(sessionSettings.imgShowTimeSelected, 10);

        // Save current session settings to persistent store
        try {
            const persistentStore = await load("store.json", { autoSave: false });
            await persistentStore.set("imgFolder", sessionSettings.imgFolder);
            await persistentStore.set("imgShowTimeSelected", sessionSettings.imgShowTimeSelected);
            await persistentStore.set("imgShowTimeCustom", sessionSettings.imgShowTimeCustom);
            await persistentStore.save();
        } catch (e) {
            console.error("Failed to save session settings:", e);
        }

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
    bind:imgShowTimeSelected={sessionSettings.imgShowTimeSelected}
    bind:imgShowTimeCustom={sessionSettings.imgShowTimeCustom}
    bind:imgFolder={sessionSettings.imgFolder}
    imgUrls={sessionStore.imgs.map((img) => img.url)}
    folderErr={showFolderErr ? folderErr : ""}
    {isLoadingImgs}
    {isValid}
    {setImgFolder}
    {startSession}
/>
