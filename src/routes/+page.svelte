<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { invoke, convertFileSrc } from "@tauri-apps/api/core";
    import { load } from "@tauri-apps/plugin-store";
    import { stat } from "@tauri-apps/plugin-fs";
    import { sessionStore } from "$lib/globals.svelte";
    import MainMenuUI from "./MainMenuUI.svelte";

    let folderErr = $state("");
    let showFolderErr = $state(false);
    let isLoadingImgs = $state(false);
    const isValid = $derived.by(() => {
        return !isLoadingImgs && folderErr === "";
    });

    // Set the current folder and image paths, along with any error messages.
    async function setImgFolder(folder: string) {
        showFolderErr = false;

        sessionStore.imgFolder = folder;
        const { imgs, err } = await getImgs(folder);
        if (sessionStore.imgFolder != folder) {
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

        sessionStore.imgShowTime =
            sessionStore.imgShowTimeSelected === "custom"
                ? sessionStore.imgShowTimeCustom
                : parseInt(sessionStore.imgShowTimeSelected, 10);

        // Save current session settings to persistent store
        const persistentStore = await load("store.json", { autoSave: false });
        await persistentStore.set("imgFolder", sessionStore.imgFolder);
        await persistentStore.set("imgShowTimeSelected", sessionStore.imgShowTimeSelected);
        await persistentStore.set("imgShowTimeCustom", sessionStore.imgShowTimeCustom);
        await persistentStore.save();

        goto("/session");
    }

    onMount(async () => {
        await setImgFolder(sessionStore.imgFolder);
        // Turn off the error message if no folder is set initially
        if (sessionStore.imgFolder === "") showFolderErr = false;
    });
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<MainMenuUI
    bind:imgShowTimeSelected={sessionStore.imgShowTimeSelected}
    bind:imgShowTimeCustom={sessionStore.imgShowTimeCustom}
    bind:imgFolder={sessionStore.imgFolder}
    imgUrls={sessionStore.imgs.map((img) => img.url)}
    folderErr={showFolderErr ? folderErr : ""}
    {isLoadingImgs}
    {isValid}
    {setImgFolder}
    {startSession}
/>
