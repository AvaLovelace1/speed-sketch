<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { getCurrentWindow } from "@tauri-apps/api/window";
    import { revealItemInDir } from "@tauri-apps/plugin-opener";
    import { start, stop } from "tauri-plugin-keepawake-api";
    import { goto } from "$app/navigation";
    import { appSettings } from "$lib/app-settings.svelte";
    import { currentSession } from "$lib/drawing-session.svelte";
    import SessionUI from "./SessionUI.svelte";
    import countdownBeepFile from "$lib/assets/audio/countdown-beep.wav";
    import countdownDoneFile from "$lib/assets/audio/countdown-done.wav";
    import endAudioFile from "$lib/assets/audio/end.wav";

    const COUNTDOWN_BEEP_TIME = 3; // seconds before the end of the image to start beeping
    let isAlwaysOnTop = $state(false);

    async function exit() {
        const endAudio = new Audio(endAudioFile);
        endAudio.volume = appSettings.volume;
        await endAudio.play().catch((e) => {
            console.error("Failed to play end audio:", e);
        });
        goto("/session/end");
    }

    async function toggleAlwaysOnTop() {
        await setAlwaysOnTop(!isAlwaysOnTop)
            .then(() => {
                isAlwaysOnTop = !isAlwaysOnTop;
            })
            .catch((e) => {
                console.error("Failed to toggle always on top:", e);
            });
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
        if (currentSession.object.timeRemaining === 0) {
            const countdownDone = new Audio(countdownDoneFile);
            countdownDone.volume = appSettings.volume;
            countdownDone.play().catch((e) => console.error("Failed to play countdown done:", e));
        } else if (currentSession.object.timeRemaining <= COUNTDOWN_BEEP_TIME) {
            const countdownBeep = new Audio(countdownBeepFile);
            countdownBeep.volume = appSettings.volume;
            countdownBeep.play().catch((e) => console.error("Failed to play countdown beep:", e));
        }
    });

    onMount(async () => {
        await start({ display: true, idle: true, sleep: true }).catch((e) => {
            console.error("Failed to start keep awake:", e);
        });
        currentSession.object.resume();
    });

    onDestroy(async () => {
        currentSession.object.pause();
        await stop().catch((e) => {
            console.error("Failed to stop keep awake:", e);
        });
        await setAlwaysOnTop(false).catch((e) => {
            console.error("Failed to reset always on top:", e);
        });
    });
</script>

<svelte:head>
    <title>SpeedSketch - session in progress</title>
</svelte:head>

<SessionUI
    drawingSession={currentSession.object}
    {isAlwaysOnTop}
    {exit}
    {toggleAlwaysOnTop}
    {showImageFolder}
/>
