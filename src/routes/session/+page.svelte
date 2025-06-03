<script lang="ts">
    import {ArrowLeft, ArrowRight, CircleCheck, LogOut, Pause, Play} from '@lucide/svelte';
    import {fade} from 'svelte/transition';
    import {cubicOut} from 'svelte/easing';
    import {goto} from '$app/navigation';
    import ControlsMenu from '$lib/components/ControlsMenu.svelte';
    import Timer from '$lib/components/Timer.svelte';
    import StatusAlert from '$lib/components/StatusAlert.svelte';

    let showControls = $state(false);
    let hideControlsTimeout: NodeJS.Timeout | undefined = undefined;
    let isPaused = $state(false);

    const initialTime = 70;
    let timeRemaining = $state(initialTime);
    let timerInterval: NodeJS.Timeout | undefined = undefined;

    let nCompleted = $state(0);

    function doShowControls() {
        showControls = true;
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            showControls = false;
        }, 3000);
    }

    function doHideControls() {
        showControls = false;
        clearTimeout(hideControlsTimeout);
    }

    function doPrevImg() {
        console.log('Previous image');
    }

    function doNextImg() {
        console.log('Next image');
    }

    function doPause() {
        isPaused = true;
        clearInterval(timerInterval);
        doShowControls();
    }

    function doResume() {
        isPaused = false;
        timerInterval = setInterval(() => {
            if (timeRemaining > 0) timeRemaining--;
            else {
                nCompleted += 1;
                timeRemaining = initialTime;
            }
        }, 1000);
        doShowControls();
    }

    function doExit() {
        goto('/');
    }

    function onKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowLeft':
                console.log('Previous image');
                break;
            case 'ArrowRight':
                console.log('Next image');
                break;
            case ' ':
                if (isPaused) doResume();
                else doPause();
                break;
            case 'Escape':
                console.log('Exit session');
                break;
        }
    }

    const prevBtn = {label: 'PREV', Icon: ArrowLeft, action: doPrevImg, btnClass: 'btn-primary'};
    const nextBtn = {label: 'NEXT', Icon: ArrowRight, action: doNextImg, btnClass: 'btn-primary'};
    const pauseBtn = {label: 'PAUSE', Icon: Pause, action: doPause, btnClass: 'btn-warning'};
    const resumeBtn = {label: 'RESUME', Icon: Play, action: doResume, btnClass: 'btn-success'};
    const exitBtn = {label: 'EXIT', Icon: LogOut, action: doExit, btnClass: 'btn-error'};
    const controls = $derived([
        prevBtn,
        nextBtn,
        isPaused ? resumeBtn : pauseBtn,
        exitBtn,
    ]);

    doResume();
</script>

<svelte:window onkeydown={onKeyDown}/>

<svelte:body onmousemove={doShowControls} onmouseleave={doHideControls}/>

<div role="main" class="flex flex-col min-h-dvh items-center justify-center">
    <div class="relative">
        <img src="example.png" alt="Reference used for drawing practice" class="max-w-dvw max-h-dvh"/>
        {#if showControls}
            <div class="absolute toast toast-top toast-start" title="Images completed"
                 transition:fade={{duration: 200}}>
                <StatusAlert alertClass="font-mono">
                    <CircleCheck size={20}/>{nCompleted}
                </StatusAlert>
            </div>
        {/if}
        <div class="absolute toast toast-top toast-end" title="Time remaining">
            <Timer time={timeRemaining}/>
            {#if isPaused}
                <StatusAlert alertClass="alert-error">
                    <Pause size={20}/>
                    PAUSED
                </StatusAlert>
            {/if}
        </div>
        <div class="absolute toast toast-top toast-end" title="Time remaining">
        </div>
    </div>
    {#if showControls}
        <div class="fixed bottom-0 w-full shadow-sm flex flex-row justify-center p-4"
             transition:fade={{duration: 200, easing: cubicOut}}>
            <ControlsMenu {controls}/>
        </div>
    {/if}
</div>

