<!--
@component
The user interface for a drawing session.
-->
<script lang="ts">
    import { fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { convertFileSrc } from '@tauri-apps/api/core';
    import Toolbar from './Toolbar.svelte';
    import Timer from './Timer.svelte';
    import StatusAlert from './StatusAlert.svelte';

    const controlsFade = { duration: 200, easing: cubicOut };
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
        key: 'prev',
        label: 'PREV',
        icon: 'lucide--arrow-left',
        action: goPrevImg,
        hotkey: 'ArrowLeft',
        class: 'btn-primary',
        title: 'Previous image (left arrow)',
    };
    const nextBtn = {
        key: 'next',
        label: 'NEXT',
        icon: 'lucide--arrow-right',
        action: goNextImg,
        hotkey: 'ArrowRight',
        class: 'btn-primary',
        title: 'Next image (right arrow)',
    };
    const pauseBtn = $derived({
        key: 'pause',
        label: isPaused ? 'RESUME' : 'PAUSE',
        icon: isPaused ? 'lucide--play' : 'lucide--pause',
        action: togglePause,
        hotkey: ' ',
        class: isPaused ? 'btn-success' : 'btn-warning',
        title: isPaused ? 'Resume (space)' : 'Pause (space)',
    });
    const exitBtn = {
        key: 'exit',
        label: 'EXIT',
        icon: 'lucide--log-out',
        action: exit,
        hotkey: 'Escape',
        class: 'btn-error',
        title: 'Exit session (esc)',
    };
    const controls = $derived([prevBtn, nextBtn, pauseBtn, exitBtn]);
</script>

<svelte:body onmousemove={showControls} onmouseleave={hideControls} />

<div role="main" class="flex h-dvh items-center justify-center">
    <img
        src={convertFileSrc(curImg)}
        alt="Reference used for drawing practice"
        class="size-full object-contain"
    />
    {#if controlsShown}
        <div class="toast toast-top toast-start" transition:fade={controlsFade}>
            <StatusAlert class="alert-success font-mono" title="Images completed">
                <span class="iconify lucide--circle-check"></span>{nCompletedImgs}
            </StatusAlert>
        </div>
    {/if}
    <div class="toast toast-top toast-end">
        <div>
            <Timer time={timeRemaining} class="float-right font-mono" title="Time remaining" />
        </div>
        {#if isPaused}
            <StatusAlert class="alert-error font-mono">
                <span class="iconify lucide--pause"></span>PAUSED
            </StatusAlert>
        {/if}
    </div>
    {#if controlsShown}
        <div
            class="fixed bottom-0 flex w-full flex-row justify-center p-4 shadow-sm"
            transition:fade={controlsFade}
            onfocusin={showControls}
        >
            <Toolbar {controls} />
        </div>
    {:else}
        <div hidden>
            <Toolbar {controls} />
            <!-- Controls must be hidden but still present for keyboard shortcuts to work-->
        </div>
    {/if}
</div>
