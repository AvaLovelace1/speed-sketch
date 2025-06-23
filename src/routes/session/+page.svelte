<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { getCurrentWindow } from "@tauri-apps/api/window";
    import { revealItemInDir } from "@tauri-apps/plugin-opener";
    import { start, stop } from "tauri-plugin-keepawake-api";
    import { goto } from "$app/navigation";
    import { settings, sessionStore } from "$lib/globals.svelte";
    import SessionUI from "./SessionUI.svelte";
    import countdownBeepFile from "$lib/assets/audio/countdown-beep.wav";
    import countdownDoneFile from "$lib/assets/audio/countdown-done.wav";
    import endAudioFile from "$lib/assets/audio/end.wav";

    const countdownBeepTime = 3; // seconds before the end of the image to start beeping

    // Index of the current image being displayed
    let curImgIdx = $state(0);
    let nCompletedImgs = $state(0);
    // Time remaining for the current image to be displayed, in seconds
    let timeRemaining = $state(sessionStore.imgShowTime);
    let timeSpent = 0;
    // Timer interval that updates the time remaining with each tick
    let timer: NodeJS.Timeout | undefined = undefined;
    let isPaused = $state(false);
    let isAlwaysOnTop = $state(false);
    let sessionUI: SessionUI;

    function goPrevImg() {
        curImgIdx -= 1;
        if (curImgIdx < 0) curImgIdx = sessionStore.imgs.length - 1;
        timeRemaining = sessionStore.imgShowTime;
        if (!isPaused) restartTimer();
    }

    function goNextImg() {
        curImgIdx += 1;
        if (curImgIdx >= sessionStore.imgs.length) curImgIdx = 0;
        timeRemaining = sessionStore.imgShowTime;
        if (!isPaused) restartTimer();
    }

    function pause() {
        isPaused = true;
        clearTimer();
        sessionUI.showToolbar();
    }

    function resume() {
        isPaused = false;
        restartTimer();
        sessionUI.showToolbar();
    }

    function togglePause() {
        if (isPaused) resume();
        else pause();
    }

    async function exit() {
        const endAudio = new Audio(endAudioFile);
        endAudio.volume = settings.volume;
        await endAudio.play().catch((e) => {
            console.error("Failed to play end audio:", e);
        });
        sessionStore.nCompletedImgs = nCompletedImgs;
        sessionStore.timeSpent = timeSpent;
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
        const curImgPath = sessionStore.imgs[curImgIdx].path;
        if (!curImgPath) {
            console.error("No image filepath available to reveal in folder.");
            return;
        }
        await revealItemInDir(curImgPath).catch((e) => {
            console.error("Failed to reveal item in directory:", e);
        });
    }

    function restartTimer() {
        clearTimer();
        timer = setInterval(async () => {
            if (timeRemaining > 0) {
                if (timeRemaining <= countdownBeepTime) {
                    const countdownBeep = new Audio(countdownBeepFile);
                    countdownBeep.volume = settings.volume;
                    await countdownBeep
                        .play()
                        .catch((e) => console.error("Failed to play countdown beep:", e));
                }
                timeRemaining--;
                timeSpent++;
            } else {
                // The image is completed
                const countdownDone = new Audio(countdownDoneFile);
                countdownDone.volume = settings.volume;
                await countdownDone
                    .play()
                    .catch((e) => console.error("Failed to play countdown done:", e));
                nCompletedImgs += 1;
                goNextImg();
            }
        }, 1000);
    }

    function clearTimer() {
        clearInterval(timer);
    }

    onMount(async () => {
        await start({ display: true, idle: true, sleep: true }).catch((e) => {
            console.error("Failed to start keep awake:", e);
        });
        resume();
    });

    onDestroy(async () => {
        clearTimer();
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
    bind:this={sessionUI}
    curImgUrl={sessionStore.imgs[curImgIdx].url}
    {nCompletedImgs}
    maxTime={sessionStore.imgShowTime}
    {timeRemaining}
    {isPaused}
    {isAlwaysOnTop}
    {goPrevImg}
    {goNextImg}
    {pause}
    {resume}
    {togglePause}
    {exit}
    {toggleAlwaysOnTop}
    {showImageFolder}
/>
