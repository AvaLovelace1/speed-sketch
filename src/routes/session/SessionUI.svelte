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

    // Toolbar state management
    let toolbarShown = $state(false);
    let toolbarIsHovered = $state(false);
    let toolbarShouldAutoHide = $derived(!isFrozen && !toolbarIsHovered);
    let hideToolbarTimeout: NodeJS.Timeout | undefined = undefined;

    // Image state management
    let isFlippedHorizontal = $state(false);
    let isFlippedVertical = $state(false);
    let isGreyscale = $state(false);
    let isHighContrast = $state(false);
    let isBlurred = $state(false);

    // UI state management
    let timerShown = $state(true);

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
        tooltip: "Previous image",
    };
    const nextBtn = {
        key: "next",
        label: "Next",
        icon: "lucide--arrow-right",
        action: goNextImg,
        hotkey: "ArrowRight",
        tooltip: "Next image",
    };
    const pauseBtn = $derived({
        key: "pause",
        label: isPaused ? "Resume" : "Pause",
        icon: isPaused ? "lucide--play" : "lucide--pause",
        action: togglePause,
        hotkey: " ",
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
    const flipHorizontalBtn = $derived({
        key: "flip-horizontal",
        label: "Flip horizontal",
        icon: "lucide--flip-horizontal-2",
        action: () => (isFlippedHorizontal = !isFlippedHorizontal),
        hotkey: "f",
        class: ["btn-primary", isFlippedHorizontal ? "btn-active" : ""],
        tooltip: "Flip horizontally",
    });
    const flipVerticalBtn = $derived({
        key: "flip-vertical",
        label: "Flip vertical",
        icon: "lucide--flip-vertical-2",
        action: () => (isFlippedVertical = !isFlippedVertical),
        hotkey: "F",
        class: ["btn-primary", isFlippedVertical ? "btn-active" : ""],
        tooltip: "Flip vertically",
    });
    const greyscaleBtn = $derived({
        key: "greyscale",
        label: "Greyscale",
        icon: "lucide--blend",
        action: () => (isGreyscale = !isGreyscale),
        hotkey: "g",
        class: ["btn-secondary", isGreyscale ? "btn-active" : ""],
        tooltip: "Greyscale",
    });
    const blurBtn = $derived({
        key: "blur",
        label: "Blur",
        icon: "lucide--droplet",
        action: () => (isBlurred = !isBlurred),
        pressed: isBlurred,
        hotkey: "b",
        class: ["btn-secondary", isBlurred ? "btn-active" : ""],
        tooltip: "Blur",
    });
    const highContrastBtn = $derived({
        key: "high-contrast",
        label: "High contrast",
        icon: "lucide--contrast",
        action: () => (isHighContrast = !isHighContrast),
        hotkey: "c",
        class: ["btn-secondary", isHighContrast ? "btn-active" : ""],
        tooltip: "High contrast",
    });
    const hideTimerBtn = $derived({
        key: "hide-timer",
        label: timerShown ? "Hide timer" : "Show timer",
        icon: "lucide--timer-off",
        action: () => (timerShown = !timerShown),
        hotkey: "t",
        class: ["btn-info", !timerShown ? "btn-active" : ""],
        tooltip: timerShown ? "Hide timer" : "Show timer",
    });
    const toolsets = $derived([
        [prevBtn, pauseBtn, nextBtn],
        [flipHorizontalBtn, flipVerticalBtn, greyscaleBtn, highContrastBtn, blurBtn],
        [hideTimerBtn, exitBtn],
    ]);

    onMount(resetToolbarTimeout);
</script>

<svelte:body onmousemove={showToolbar} onmouseleave={hideToolbar} />

<main class="bg-base-100 flex h-dvh items-center justify-center bg-(image:--fx-noise)">
    <img
        src={curImg}
        alt="Reference used for drawing practice"
        class="size-full object-contain
               {isFlippedVertical ? 'rotate-x-180' : ''}
               {isFlippedHorizontal ? 'rotate-y-180' : ''}
               {isGreyscale ? 'grayscale' : ''}
               {isHighContrast ? 'contrast-500' : ''}
               {isBlurred ? 'blur-sm' : ''}"
    />
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
                <StatusAlert class="alert-success tabular-nums" aria-label="Images completed">
                    <span class="iconify lucide--circle-check"></span>{nCompletedImgs}
                </StatusAlert>
                {#snippet tooltipContent()}Images completed{/snippet}
            </Tooltip>
        </div>
    {/key}
    <div class="toast toast-top toast-end items-end">
        {#if timerShown}
            <Tooltip side="left">
                <Timer
                    label="Time remaining"
                    time={timeRemaining}
                    {maxTime}
                    class={isPaused ? "text-muted!" : ""}
                />
                {#snippet tooltipContent()}Time remaining{/snippet}
            </Tooltip>
        {/if}
        {#if isPaused}
            <StatusAlert class="alert-error">
                <span class="iconify lucide--pause"></span>Paused
            </StatusAlert>
        {/if}
    </div>
    {#key toolbarShown}
        <div
            class="fixed bottom-0 mb-4 flex w-full justify-center space-x-4
                   {toolbarShown ? '' : 'sr-only'}"
            onfocusin={showToolbar}
            transition:fade={toolbarFade}
        >
            {#each toolsets as tools, i (i)}
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
            {/each}
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
