<script lang="ts">
    import { onMount } from 'svelte';
    import { start, stop } from 'tauri-plugin-keepawake-api';
    import { goto } from '$app/navigation';
    import { sessionStore } from '$lib/globals.svelte';
    import SessionUI from './SessionUI.svelte';

    // Index of the current image being displayed
    let curImgIdx = $state(0);
    let nCompletedImgs = $state(0);
    // Time remaining for the current image to be displayed, in seconds
    let timeRemaining = $state(sessionStore.imgShowTime);
    // Timer interval that updates the time remaining with each tick
    let timer: NodeJS.Timeout | undefined = undefined;
    let isPaused = $state(false);
    let sessionUI: SessionUI;

    function goPrevImg() {
        curImgIdx -= 1;
        if (curImgIdx < 0) curImgIdx = sessionStore.imgPaths.length - 1;
        timeRemaining = sessionStore.imgShowTime;
        if (!isPaused) restartTimer();
    }

    function goNextImg() {
        curImgIdx += 1;
        if (curImgIdx >= sessionStore.imgPaths.length) curImgIdx = 0;
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
        try {
            await stop(); // Stop keep awake
        } catch (e) {
            console.error('Failed to stop keep awake:', e);
        }
        goto('/');
    }

    function restartTimer() {
        clearTimer();
        timer = setInterval(() => {
            if (timeRemaining > 0) timeRemaining--;
            else {
                // The image is completed
                nCompletedImgs += 1;
                goNextImg();
            }
        }, 1000);
    }

    function clearTimer() {
        clearInterval(timer);
    }

    onMount(async () => {
        try {
            await start({ display: true, idle: true, sleep: true });
        } catch (e) {
            console.error('Failed to start keep awake:', e);
        }
        resume();
    });
</script>

<svelte:head>
    <title>SpeedSketch - session in progress</title>
</svelte:head>

<SessionUI
    bind:this={sessionUI}
    curImg={sessionStore.imgPaths[curImgIdx]}
    {nCompletedImgs}
    {timeRemaining}
    {isPaused}
    {goPrevImg}
    {goNextImg}
    {togglePause}
    {exit}
/>
