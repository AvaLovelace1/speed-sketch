<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { isTauri } from "@tauri-apps/api/core";
    import { getCurrentWindow } from "@tauri-apps/api/window";
    import { revealItemInDir } from "@tauri-apps/plugin-opener";
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
    import { currentSession } from "$lib/drawing-session.svelte";
    import { startWakelock, stopWakelock } from "$lib/wakelock.svelte";
    import SessionScreen from "./SessionScreen.svelte";
    import { playCountdownBeep, playCountdownDone, playStartAudio } from "$lib/audio";

    const COUNTDOWN_BEEP_TIME = 3; // seconds before the end of the image to start beeping

    async function exit() {
        await goto(`${base}/session/end`, { replaceState: true });
    }

    async function setAlwaysOnTop(value: boolean) {
        await getCurrentWindow().setAlwaysOnTop(value);
    }

    async function showImageFolder() {
        const curImgPath = currentSession.object.getCurImg().path;
        if (!curImgPath) {
            console.error("No image filepath available to reveal in folder.");
            return;
        }
        await revealItemInDir(curImgPath).catch((e) => {
            console.error("Failed to reveal item in directory:", e);
        });
    }

    $effect(() => {
        if (currentSession.object.timeRemaining === 0) playCountdownDone();
        else if (currentSession.object.timeRemaining <= COUNTDOWN_BEEP_TIME) playCountdownBeep();
    });

    function beforeUnloadHandler(e: BeforeUnloadEvent) {
        e.preventDefault();
    }

    onMount(async () => {
        if (!isTauri()) window.addEventListener("beforeunload", beforeUnloadHandler);

        await startWakelock().catch((e) => {
            console.error("Failed to start wakelock:", e);
        });

        await playStartAudio();
        currentSession.object.resume();
    });

    onDestroy(async () => {
        currentSession.object.pause();

        await stopWakelock().catch((e) => {
            console.error("Failed to stop wakelock:", e);
        });

        if (!isTauri()) window.removeEventListener("beforeunload", beforeUnloadHandler);

        if (isTauri()) {
            await setAlwaysOnTop(false).catch((e) => {
                console.error("Failed to reset always on top:", e);
            });
        }
    });
</script>

<svelte:head>
    <title>SpeedSketch - session in progress</title>
</svelte:head>

<SessionScreen
    drawingSession={currentSession.object}
    {exit}
    setAlwaysOnTop={isTauri() ? setAlwaysOnTop : null}
    showImageFolder={isTauri() ? showImageFolder : null}
/>
