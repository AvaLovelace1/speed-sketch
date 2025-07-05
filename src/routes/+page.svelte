<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import MainMenuUI from "./MainMenuUI.svelte";
    import startAudioFile from "$lib/assets/audio/start.wav";
    import { appSettings } from "$lib/store/app-settings.svelte";
    import { type Image } from "$lib/types.svelte";
    import { DrawingSession, currentSession } from "$lib/drawing-session.svelte";
    import { sessionSettings } from "$lib/store/session-settings.svelte";

    let imgs = $state<Image[]>([]);
    let imgErrMsg = $state("");
    let isLoadingImgs = $state(false);
    let canStartSession = $state(false);

    function setLoadingImgs(value: boolean) {
        isLoadingImgs = value;
    }

    // Updates the shown images from inputImgsOrFolder. If inputImgsOrFolder is null, it uses the current session settings.
    export async function onImagesInput(inputImgsOrFolder: string | Image[] | null) {
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

        const startAudio = new Audio(startAudioFile);
        startAudio.volume = appSettings.volume;
        await startAudio.play().catch((e) => {
            console.error("Failed to play start audio:", e);
        });
        await goto("/session", { replaceState: true });
    }

    onMount(async () => {
        if (sessionSettings.imgFolder) await onImagesInput(sessionSettings.imgFolder);
        else if (sessionSettings.imgs.length > 0) await onImagesInput(sessionSettings.imgs);
    });
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<MainMenuUI
    {imgs}
    {isLoadingImgs}
    {imgErrMsg}
    {canStartSession}
    {setLoadingImgs}
    {onImagesInput}
    {startSession}
/>
