<!--
@component
The user interface for a drawing session.
-->
<script lang="ts">
    import { fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import AlertDialog from "$lib/components/AlertDialog.svelte";
    import Timer from "$lib/components/Timer.svelte";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import StatusAlert from "$lib/components/StatusAlert.svelte";
    import { onMount } from "svelte";

    const toolbarFade = { duration: 200, easing: cubicOut };
    // Duration after which toolbar will be hidden automatically
    const hideToolbarTimeoutDuration = 3000;

    interface Props {
        curImg: string;
        nCompletedImgs?: number;
        maxTime?: number;
        timeRemaining?: number;
        isPaused?: boolean;
        goPrevImg?: () => void;
        goNextImg?: () => void;
        pause?: () => void;
        resume?: () => void;
        togglePause?: () => void;
        exit?: () => void;
    }

    const {
        curImg,
        nCompletedImgs = 0,
        maxTime = 60,
        timeRemaining = 60,
        isPaused = false,
        goPrevImg = () => {},
        goNextImg = () => {},
        pause = () => {},
        resume = () => {},
        togglePause = () => {},
        exit = () => {},
    }: Props = $props();

    let isFrozen = $state(false);

    let toolbarShown = $state(false);
    let toolbarIsHovered = $state(false);
    let toolbarShouldAutoHide = $derived(!isFrozen && !toolbarIsHovered);
    let hideToolbarTimeout: NodeJS.Timeout | undefined = undefined;

    let confirmExitDialog: AlertDialog;

    export function showToolbar() {
        toolbarShown = true;
        resetToolbarTimeout();
    }

    export function hideToolbar() {
        toolbarShown = false;
    }

    function resetToolbarTimeout() {
        clearTimeout(hideToolbarTimeout);
        hideToolbarTimeout = setTimeout(() => {
            if (toolbarShouldAutoHide) hideToolbar();
            else resetToolbarTimeout();
        }, hideToolbarTimeoutDuration);
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
        key: "prev",
        label: "Prev",
        icon: "lucide--arrow-left",
        action: goPrevImg,
        hotkey: "ArrowLeft",
        class: "btn-primary",
        tooltip: "Previous image",
    };
    const nextBtn = {
        key: "next",
        label: "Next",
        icon: "lucide--arrow-right",
        action: goNextImg,
        hotkey: "ArrowRight",
        class: "btn-primary",
        tooltip: "Next image",
    };
    const pauseBtn = $derived({
        key: "pause",
        label: isPaused ? "Resume" : "Pause",
        icon: isPaused ? "lucide--play" : "lucide--pause",
        action: togglePause,
        hotkey: " ",
        class: isPaused ? "btn-success" : "btn-warning",
        tooltip: isPaused ? "Resume" : "Pause",
    });
    const exitBtn = {
        key: "exit",
        label: "Exit",
        icon: "lucide--log-out",
        action: () => confirmExitDialog.open(),
        hotkey: "Escape",
        class: "btn-error",
        tooltip: "Exit session",
    };
    const tools = $derived([prevBtn, nextBtn, pauseBtn, exitBtn]);

    onMount(resetToolbarTimeout);
</script>

<svelte:body onmousemove={showToolbar} onmouseleave={hideToolbar} />

<main class="bg-base-100 flex h-dvh items-center justify-center bg-(image:--fx-noise)">
    <img src={curImg} alt="Reference used for drawing practice" class="size-full object-contain" />
    {#key toolbarShown}
        <div
            class="toast toast-top toast-start {toolbarShown ? '' : 'sr-only'}"
            transition:fade={toolbarFade}
        >
            <Tooltip
                side="right"
                onmouseenter={() => {
                    toolbarIsHovered = true;
                }}
                onmouseleave={() => {
                    toolbarIsHovered = false;
                    resetToolbarTimeout();
                }}
            >
                <StatusAlert class="alert-success" aria-label="Images completed">
                    <span class="iconify lucide--circle-check"></span>{nCompletedImgs}
                </StatusAlert>
                {#snippet tooltipContent()}Images completed{/snippet}
            </Tooltip>
        </div>
    {/key}
    <div class="toast toast-top toast-end items-end">
        <Tooltip side="left">
            <Timer label="Time remaining" time={timeRemaining} {maxTime} />
            {#snippet tooltipContent()}Time remaining{/snippet}
        </Tooltip>
        {#if isPaused}
            <StatusAlert class="alert-error uppercase">
                <span class="iconify lucide--pause"></span>Paused
            </StatusAlert>
        {/if}
    </div>
    {#key toolbarShown}
        <div
            class="fixed bottom-0 mb-4 flex w-full justify-center {toolbarShown ? '' : 'sr-only'}"
            onfocusin={showToolbar}
            transition:fade={toolbarFade}
        >
            <Toolbar
                {tools}
                enableHotkeys={!isFrozen}
                onmouseenter={() => {
                    toolbarIsHovered = true;
                }}
                onmouseleave={() => {
                    toolbarIsHovered = false;
                    resetToolbarTimeout();
                }}
            />
        </div>
    {/key}
</main>

<AlertDialog
    bind:this={confirmExitDialog}
    title="Confirm Exit"
    description="Are you sure you want to end the session?"
    cancelText="No"
    confirmText="Yes"
    onOpen={freeze}
    onCancel={unfreeze}
    onConfirm={exit}
/>
