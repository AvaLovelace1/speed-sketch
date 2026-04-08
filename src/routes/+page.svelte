<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { resolve } from "$app/paths";
    import { goto } from "$app/navigation";
    import MainMenuScreen from "./MainMenuScreen.svelte";
    import { type Image } from "$lib/types.svelte";
    import { currentSession, DrawingSession } from "$lib/drawing-session.svelte";
    import { sessionSettings } from "$lib/store/session-settings.svelte";
    import { isTauri } from "@tauri-apps/api/core";
    import { getCurrentWindow } from "@tauri-apps/api/window";

    let imgs = $state<Image[]>([]);
    let imgErrMsg = $state("");
    let isLoadingImgs = $state(false);
    let imgsAreValid = $state(false);
    let scheduleIsValid = $derived(sessionSettings.sessionSchedule.length > 0);
    let canStartSession = $derived(imgsAreValid && scheduleIsValid);

    // Updates the shown images from inputImgsOrFolder. If inputImgsOrFolder is null, it uses the current session settings.
    export async function onImgsInput(inputImgsOrFolder: string | Image[] | null) {
        imgsAreValid = false;
        isLoadingImgs = true;

        let inputFolder = sessionSettings.imgFolder;
        let inputRawImgs = sessionSettings.imgs;
        if (inputImgsOrFolder !== null) {
            inputFolder = typeof inputImgsOrFolder === "string" ? inputImgsOrFolder : "";
            inputRawImgs = Array.isArray(inputImgsOrFolder) ? inputImgsOrFolder : [];
        }
        sessionSettings.imgFolder = inputFolder;
        sessionSettings.imgs = inputRawImgs;

        let inputImgs: Image[] = [];
        let inputErrMsg = "";
        try {
            inputImgs = await sessionSettings.getImgs();
        } catch (e) {
            inputErrMsg = e instanceof Error ? e.message : "Unknown error loading images";
        }

        // If the folder has changed while loading, ignore the result
        if (sessionSettings.imgFolder !== inputFolder) return;

        imgs = inputImgs;
        imgErrMsg = inputErrMsg;
        isLoadingImgs = false;
        imgsAreValid = inputImgs.length > 0 && inputErrMsg === "";
    }

    async function startSession() {
        if (!canStartSession) return;
        await sessionSettings.saveToStore();
        currentSession.object = new DrawingSession(imgs, sessionSettings.sessionSchedule);
        await goto(resolve("/session"), { replaceState: true });
    }

    let unlisten: () => void;

    onMount(async () => {
        if (sessionSettings.imgFolder) await onImgsInput(sessionSettings.imgFolder);
        else if (sessionSettings.imgs.length > 0) await onImgsInput(sessionSettings.imgs);
        if (isTauri()) {
            // Save session settings before window close
            // We need to enable core:window:allow-destroy permissions to allow the window to close after
            // Note that this doesn't fire when quitting via Cmd-Q on Mac
            unlisten = await getCurrentWindow().onCloseRequested(async (_) => {
                await sessionSettings.saveToStore();
            });
        }
    });

    onDestroy(() => {
        if (unlisten) unlisten();
    });
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<!-- Save session settings before window unloads -->
<svelte:window
    onbeforeunload={async () => {
        await sessionSettings.saveToStore();
    }}
/>

<MainMenuScreen
    {sessionSettings}
    {imgs}
    {imgErrMsg}
    bind:isLoadingImgs
    {canStartSession}
    {onImgsInput}
    {startSession}
/>
