<script lang="ts">
    import { onMount } from "svelte";
    import { base } from "$app/paths";
    import { goto } from "$app/navigation";
    import MainMenuScreen from "./MainMenuScreen.svelte";
    import { type Image } from "$lib/types.svelte";
    import { DrawingSession, currentSession } from "$lib/drawing-session.svelte";
    import { sessionSettings } from "$lib/store/session-settings.svelte";
    import { playStartAudio } from "$lib/audio";

    let imgs = $state<Image[]>([]);
    let imgErrMsg = $state("");
    let isLoadingImgs = $state(false);
    let canStartSession = $state(false);

    // Updates the shown images from inputImgsOrFolder. If inputImgsOrFolder is null, it uses the current session settings.
    export async function onImgsInput(inputImgsOrFolder: string | Image[] | null) {
        canStartSession = false;
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
        canStartSession = inputImgs.length > 0 && inputErrMsg === "";
    }

    async function startSession() {
        if (!canStartSession) return;
        await sessionSettings.saveToStore();
        currentSession.object = new DrawingSession(imgs, sessionSettings.imgShowTime);
        await playStartAudio();
        await goto(`${base}/session`, { replaceState: true });
    }

    onMount(async () => {
        if (sessionSettings.imgFolder) await onImgsInput(sessionSettings.imgFolder);
        else if (sessionSettings.imgs.length > 0) await onImgsInput(sessionSettings.imgs);
    });
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<MainMenuScreen
    {sessionSettings}
    {imgs}
    {imgErrMsg}
    bind:isLoadingImgs
    {canStartSession}
    {onImgsInput}
    {startSession}
/>
