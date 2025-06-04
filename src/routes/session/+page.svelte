<script lang="ts">
    import {ArrowLeft, ArrowRight, CircleCheck, LogOut, Pause, Play} from '@lucide/svelte';
    import {fade} from 'svelte/transition';
    import {cubicOut} from 'svelte/easing';
    import {goto} from '$app/navigation';
    import ControlsMenu from './ControlsMenu.svelte';
    import Timer from './Timer.svelte';
    import StatusAlert from './StatusAlert.svelte';

    const controlsFade = {duration: 200, easing: cubicOut};

    let controlsShown = $state(false);
    let hideControlsTimeout: NodeJS.Timeout | undefined = undefined;
    let isPaused = $state(false);

    const initialTime = 70;
    let timeRemaining = $state(initialTime);
    let timerInterval: NodeJS.Timeout | undefined = undefined;

    let nCompleted = $state(0);

    function showControls() {
        controlsShown = true;
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            controlsShown = false;
        }, 3000);
    }

    function hideControls() {
        controlsShown = false;
        clearTimeout(hideControlsTimeout);
    }

    function goPrevImg() {
        console.log('Previous image');
    }

    function goNextImg() {
        console.log('Next image');
    }

    function pause() {
        isPaused = true;
        clearInterval(timerInterval);
        showControls();
    }

    function resume() {
        isPaused = false;
        timerInterval = setInterval(() => {
            if (timeRemaining > 0) timeRemaining--;
            else {
                nCompleted += 1;
                timeRemaining = initialTime;
            }
        }, 1000);
        showControls();
    }

    function togglePause() {
        if (isPaused) resume();
        else pause();
    }

    function exit() {
        goto('/');
    }

    const prevBtn = {
        label: 'PREV', Icon: ArrowLeft, action: goPrevImg, hotkey: 'ArrowLeft',
        class: 'btn-primary', title: 'Previous image (left arrow)',
    };
    const nextBtn = {
        label: 'NEXT', Icon: ArrowRight, action: goNextImg, hotkey: 'ArrowRight',
        class: 'btn-primary', title: 'Next image (right arrow)',
    };
    const pauseBtn = $derived({
        label: isPaused ? 'RESUME' : 'PAUSE', Icon: isPaused ? Play : Pause, action: togglePause, hotkey: ' ',
        class: isPaused ? 'btn-success' : 'btn-warning', title: isPaused ? 'Resume (space)' : 'Pause (space)',
    });
    const exitBtn = {
        label: 'EXIT', Icon: LogOut, action: exit, hotkey: 'Escape',
        class: 'btn-error', title: 'Exit session (esc)',
    };
    const controls = $derived([prevBtn, nextBtn, pauseBtn, exitBtn]);

    resume();
</script>

<svelte:body onmousemove={showControls} onmouseleave={hideControls}/>

<div role="main" class="flex flex-col min-h-dvh items-center justify-center">
    <div class="relative">
        <img src="example.png" alt="Reference used for drawing practice" class="max-w-dvw max-h-dvh"/>
        {#if controlsShown}
            <div class="absolute toast toast-top toast-start" transition:fade={controlsFade}>
                <StatusAlert class="font-mono alert-success" title="Images completed">
                    <CircleCheck size={20}/>{nCompleted}
                </StatusAlert>
            </div>
        {/if}
        <div class="absolute toast toast-top toast-end">
            <div>
                <Timer time={timeRemaining} class="font-mono float-right" title="Time remaining"/>
            </div>
            {#if isPaused}
                <StatusAlert class="alert-error font-mono">
                    <Pause size={20}/>
                    PAUSED
                </StatusAlert>
            {/if}
        </div>
    </div>
    {#if controlsShown}
        <div class="fixed bottom-0 w-full shadow-sm flex flex-row justify-center p-4" transition:fade={controlsFade}>
            <ControlsMenu {controls}/>
        </div>
    {/if}
</div>

