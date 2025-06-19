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
        const { paths, err } = await getImgPaths(folder);
        if (sessionStore.imgFolder != folder) {
            // If the folder has changed while loading, ignore the result
            return;
        }
        sessionStore.imgPaths = paths;
        folderErr = err as string;

        showFolderErr = true;
    }

    // Get all image paths from the specified folder, converted to path URLs.
    async function getImgPaths(folder: string) {
        // Check if the folder is set
        if (folder === "") return { paths: [], err: "Please choose a folder" };
        // Check if the folder exists and is a directory
        try {
            const metadata = await stat(folder);
            if (!metadata.isDirectory) return { paths: [], err: "Path is not a folder" };
        } catch (err) {
            console.error("Error accessing folder:", err);
            return { paths: [], err: "Cannot access folder" };
        }

        // Load images from the folder
        isLoadingImgs = true;
        try {
            const files = (await invoke("get_img_files", {
                dir: folder,
                timeoutDuration: 60,
            })) as string[];
            const paths = files.map((file) => convertFileSrc(file));
            return { paths: paths, err: paths.length === 0 ? "No images found in folder" : "" };
        } catch (err) {
            console.error("Error loading images:", err);
            if (err === "TimeoutError") return { paths: [], err: "Loading images timed out" };
            if (err === "TaskJoinError") return { paths: [], err: "Failed to load images" };
            return { paths: [], err };
        } finally {
            isLoadingImgs = false;
        }
    }

    async function startSession() {
        if (!isValid) return;
        // Save current session settings to persistent store
        const persistentStore = await load("store.json", { autoSave: false });
        await persistentStore.set("imgFolder", sessionStore.imgFolder);
        await persistentStore.set("imgPaths", sessionStore.imgPaths);
        await persistentStore.set("imgShowTime", sessionStore.imgShowTime);
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
    bind:imgShowTime={sessionStore.imgShowTime}
    bind:imgFolder={sessionStore.imgFolder}
    imgPaths={sessionStore.imgPaths}
    folderErr={showFolderErr ? folderErr : ""}
    {isLoadingImgs}
    {isValid}
    {setImgFolder}
    {startSession}
/>
