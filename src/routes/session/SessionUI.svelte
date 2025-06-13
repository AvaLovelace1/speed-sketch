<!--
@component
The user interface for a drawing session.
-->
<script lang="ts">
    import {ArrowLeft, ArrowRight, CircleCheck, LogOut, Pause, Play} from '@lucide/svelte';
    import {fade} from 'svelte/transition';
    import {cubicOut} from 'svelte/easing';
    import {convertFileSrc} from '@tauri-apps/api/core';
    import ControlMenu from './ControlMenu.svelte';
    import Timer from './Timer.svelte';
    import StatusAlert from './StatusAlert.svelte';

    const controlsFade = {duration: 200, easing: cubicOut};
    const hideControlsTimeoutDuration = 3000;

    interface Props {
        curImg: string;
        nCompletedImgs: number;
        timeRemaining: number;
        isPaused: boolean;
        goPrevImg: () => void;
        goNextImg: () => void;
        togglePause: () => void;
        exit: () => void;
    }

    let {
        curImg,
        nCompletedImgs,
        timeRemaining,
        isPaused,
        goPrevImg,
        goNextImg,
        togglePause,
        exit,
    }: Props = $props();

    let controlsShown = $state(false);
    let hideControlsTimeout: NodeJS.Timeout | undefined = undefined;

    // Show controls, hiding them after a timeout
    export function showControls() {
        controlsShown = true;
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            controlsShown = false;
        }, hideControlsTimeoutDuration);
    }

    // Hide controls immediately
    export function hideControls() {
        controlsShown = false;
        clearTimeout(hideControlsTimeout);
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
</script>

<svelte:body onmousemove={showControls} onmouseleave={hideControls}/>

<div role="main" class="flex h-dvh items-center justify-center">
    <img src={convertFileSrc(curImg)} alt="Reference used for drawing practice"
         class="size-full object-contain"/>
    {#if controlsShown}
        <div class="toast toast-top toast-start" transition:fade={controlsFade}>
            <StatusAlert class="font-mono alert-success" title="Images completed">
                <CircleCheck size={20}/>{nCompletedImgs}
            </StatusAlert>
        </div>
    {/if}
    <div class="toast toast-top toast-end">
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
    {#if controlsShown}
        <div class="fixed bottom-0 w-full shadow-sm flex flex-row justify-center p-4"
             transition:fade={controlsFade} onfocusin={showControls}>
            <ControlMenu {controls}/>
        </div>
    {:else}
        <div hidden>
            <ControlMenu {controls}/> <!-- Controls must be hidden but still present for keyboard shortcuts to work-->
        </div>
    {/if}
</div>
