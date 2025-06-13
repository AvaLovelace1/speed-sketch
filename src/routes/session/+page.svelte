<script lang="ts">
    import {onMount} from 'svelte';
    import {goto} from '$app/navigation';
    import {sessionStore} from '$lib/globals.svelte';
    import SessionUI from './SessionUI.svelte';

    // Index of the current image being displayed
    let curImgIdx = $state(0);
    let nCompletedImgs = $state(0);
    // Time remaining for the current image to be displayed, in seconds
    let timeRemaining = $state(sessionStore.imgShowTime);
    let isPaused = $state(false);

    let sessionUI: SessionUI;

    function goPrevImg() {
        curImgIdx -= 1;
        if (curImgIdx < 0) curImgIdx = sessionStore.imgFiles.length - 1;
        timeRemaining = sessionStore.imgShowTime;
    }

    function goNextImg() {
        curImgIdx += 1;
        if (curImgIdx >= sessionStore.imgFiles.length) curImgIdx = 0;
        timeRemaining = sessionStore.imgShowTime;
    }

    function pause() {
        isPaused = true;
        sessionUI.showControls();
    }

    function resume() {
        isPaused = false;
        sessionUI.showControls();
    }

    function togglePause() {
        if (isPaused) resume();
        else pause();
    }

    function exit() {
        goto('/');
    }

    onMount(() => {
        // Set a timer interval to update the time remaining every second
        setInterval(() => {
            if (isPaused) return;
            if (timeRemaining > 0) {
                timeRemaining--;
            } else { // Increment the completed images count when time runs out
                nCompletedImgs += 1;
                timeRemaining = sessionStore.imgShowTime;
            }
        }, 1000);
        resume();
    });
</script>

<svelte:head>
    <title>SpeedSketch - session in progress</title>
</svelte:head>

<SessionUI bind:this={sessionUI} curImg={sessionStore.imgFiles[curImgIdx]} {nCompletedImgs} {timeRemaining} {isPaused}
           {goPrevImg} {goNextImg} {togglePause} {exit}/>
