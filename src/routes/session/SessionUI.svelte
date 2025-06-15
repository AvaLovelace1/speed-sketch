<!--
@component
The user interface for a drawing session.
-->
<script lang="ts">
    import { fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import Timer from './Timer.svelte';
    import Toolbar from './Toolbar.svelte';
    import StatusAlert from './StatusAlert.svelte';

    const toolbarFade = { duration: 200, easing: cubicOut };
    // Duration after which toolbar will be hidden automatically
    const hideToolbarTimeoutDuration = 3000;

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

    const {
        curImg,
        nCompletedImgs,
        timeRemaining,
        isPaused,
        goPrevImg,
        goNextImg,
        togglePause,
        exit,
    }: Props = $props();

    let toolbarShown = $state(false);
    let hideToolbarTimeout: NodeJS.Timeout | undefined = undefined;

    // Show toolbar, hiding it after a timeout
    export function showToolbar() {
        toolbarShown = true;
        clearTimeout(hideToolbarTimeout);
        hideToolbarTimeout = setTimeout(() => {
            toolbarShown = false;
        }, hideToolbarTimeoutDuration);
    }

    // Hide toolbar immediately
    export function hideToolbar() {
        toolbarShown = false;
        clearTimeout(hideToolbarTimeout);
    }

    const prevBtn = {
        key: 'prev',
        label: 'PREV',
        icon: 'lucide--arrow-left',
        action: goPrevImg,
        hotkey: 'ArrowLeft',
        class: 'btn-primary',
        tooltip: 'Previous image',
    };
    const nextBtn = {
        key: 'next',
        label: 'NEXT',
        icon: 'lucide--arrow-right',
        action: goNextImg,
        hotkey: 'ArrowRight',
        class: 'btn-primary',
        tooltip: 'Next image',
    };
    const pauseBtn = $derived({
        key: 'pause',
        label: isPaused ? 'RESUME' : 'PAUSE',
        icon: isPaused ? 'lucide--play' : 'lucide--pause',
        action: togglePause,
        hotkey: ' ',
        class: isPaused ? 'btn-success' : 'btn-warning',
        tooltip: isPaused ? 'Resume' : 'Pause',
    });
    const exitBtn = {
        key: 'exit',
        label: 'EXIT',
        icon: 'lucide--log-out',
        action: exit,
        hotkey: 'Escape',
        class: 'btn-error',
        tooltip: 'Exit session',
    };
    const tools = $derived([prevBtn, nextBtn, pauseBtn, exitBtn]);
</script>

<svelte:body onmousemove={showToolbar} onmouseleave={hideToolbar} />

<div role="main" class="flex h-dvh items-center justify-center">
    <img src={curImg} alt="Reference used for drawing practice" class="size-full object-contain" />
    {#key toolbarShown}
        <div
            class="toast toast-top toast-start {toolbarShown ? '' : 'sr-only'}"
            transition:fade={toolbarFade}
        >
            <div class="tooltip tooltip-right" data-tip="# Images completed">
                <StatusAlert class="alert-success" aria-label="Images completed">
                    <span class="iconify lucide--circle-check"></span>{nCompletedImgs}
                </StatusAlert>
            </div>
        </div>
    {/key}
    <div class="toast toast-top toast-end items-end">
        <div class="tooltip tooltip-left" data-tip="Time remaining">
            <Timer time={timeRemaining} aria-label="Time remaining" />
        </div>
        {#if isPaused}
            <StatusAlert class="alert-error">
                <span class="iconify lucide--pause"></span>PAUSED
            </StatusAlert>
        {/if}
    </div>
    {#key toolbarShown}
        <div
            class="fixed bottom-0 mb-4 flex w-full justify-center {toolbarShown ? '' : 'sr-only'}"
            transition:fade={toolbarFade}
        >
            <Toolbar {tools} />
        </div>
    {/key}
</div>
