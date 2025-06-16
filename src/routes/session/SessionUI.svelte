<!--
@component
The user interface for a drawing session.
-->
<script lang="ts">
    import { fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import AlertDialog from '$lib/components/AlertDialog.svelte';
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
        pause: () => void;
        resume: () => void;
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
        pause,
        resume,
        togglePause,
        exit,
    }: Props = $props();

    let toolbarShown = $state(false);
    let hideToolbarTimeout: NodeJS.Timeout | undefined = undefined;
    let isFrozen = $state(false);
    let confirmExitDialog: AlertDialog;

    // Show toolbar, hiding it after a timeout
    export function showToolbarWithTimeout() {
        toolbarShown = true;
        clearTimeout(hideToolbarTimeout);
        hideToolbarTimeout = setTimeout(() => {
            toolbarShown = false;
        }, hideToolbarTimeoutDuration);
    }

    // Show toolbar without timeout
    export function showToolbar() {
        toolbarShown = true;
        clearTimeout(hideToolbarTimeout);
    }

    // Hide toolbar immediately
    export function hideToolbar() {
        toolbarShown = false;
        clearTimeout(hideToolbarTimeout);
    }

    // Prevent any further interaction with the UI
    function freeze() {
        isFrozen = true;
        pause();
        showToolbar();
    }

    function unfreeze() {
        isFrozen = false;
        resume();
    }

    const prevBtn = {
        key: 'prev',
        label: 'Prev',
        icon: 'lucide--arrow-left',
        action: goPrevImg,
        hotkey: 'ArrowLeft',
        class: 'btn-primary',
        tooltip: 'Previous image',
    };
    const nextBtn = {
        key: 'next',
        label: 'Next',
        icon: 'lucide--arrow-right',
        action: goNextImg,
        hotkey: 'ArrowRight',
        class: 'btn-primary',
        tooltip: 'Next image',
    };
    const pauseBtn = $derived({
        key: 'pause',
        label: isPaused ? 'Resume' : 'Pause',
        icon: isPaused ? 'lucide--play' : 'lucide--pause',
        action: togglePause,
        hotkey: ' ',
        class: isPaused ? 'btn-success' : 'btn-warning',
        tooltip: isPaused ? 'Resume' : 'Pause',
    });
    const exitBtn = {
        key: 'exit',
        label: 'Exit',
        icon: 'lucide--log-out',
        action: () => confirmExitDialog.open(),
        hotkey: 'Escape',
        class: 'btn-error',
        tooltip: 'Exit session',
    };
    const tools = $derived([prevBtn, nextBtn, pauseBtn, exitBtn]);
</script>

<svelte:body
    onmousemove={isFrozen ? () => {} : showToolbarWithTimeout}
    onmouseleave={isFrozen ? () => {} : hideToolbar}
/>

<div role="main" class="flex h-dvh items-center justify-center">
    <img src={curImg} alt="Reference used for drawing practice" class="size-full object-contain" />
    {#key toolbarShown}
        <div
            class="toast toast-top toast-start {toolbarShown ? '' : 'sr-only'}"
            transition:fade={toolbarFade}
        >
            <div class="tooltip tooltip-right" data-tip="# Images completed">
                <StatusAlert class="alert-success font-mono" aria-label="Images completed">
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
                <span class="iconify lucide--pause"></span>Paused
            </StatusAlert>
        {/if}
    </div>
    {#key toolbarShown}
        <div
            class="fixed bottom-0 mb-4 flex w-full justify-center {toolbarShown ? '' : 'sr-only'}"
            onfocusin={showToolbarWithTimeout}
            transition:fade={toolbarFade}
        >
            <Toolbar {tools} enableHotkeys={!isFrozen} />
        </div>
    {/key}
</div>

<AlertDialog
    bind:this={confirmExitDialog}
    title="Confirm Exit"
    description="Are you sure you want to exit the session?"
    cancelText="No"
    confirmText="Yes, exit"
    onOpen={freeze}
    onCancel={unfreeze}
    onConfirm={exit}
/>
