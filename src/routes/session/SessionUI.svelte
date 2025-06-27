<!--
@component
The user interface for a drawing session.
-->
<script lang="ts">
    import type { Attachment } from "svelte/attachments";
    import createPanZoom, { type PanZoom } from "panzoom";
    import {
        contrastOptions,
        blurOptions,
        appSettings,
        appSettingsDialog,
    } from "$lib/app-settings.svelte.js";
    import AlertDialog from "$lib/components/dialog/AlertDialog.svelte";
    import Timer from "$lib/components/Timer.svelte";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import StatusAlert from "$lib/components/StatusAlert.svelte";
    import { onDestroy, onMount } from "svelte";
    import Background from "$lib/components/Background.svelte";
    import type { DrawingSession } from "$lib/drawing-session.svelte";

    const TOOLBAR_TRANSITION = "duration-300 ease-out";
    // Duration after which toolbar will be hidden automatically
    const HIDE_TOOLBAR_TIMEOUT_DURATION = 3000;

    interface Props {
        drawingSession: DrawingSession;
        isAlwaysOnTop?: boolean;
        exit?: () => void;
        toggleAlwaysOnTop?: () => Promise<void>;
        showImageFolder?: () => Promise<void>;
    }

    const {
        drawingSession,
        isAlwaysOnTop = false,
        exit = () => {},
        toggleAlwaysOnTop = async () => {},
        showImageFolder = async () => {},
    }: Props = $props();

    let isFrozen = $state(false);

    // Toolbar state management
    let toolbarShown = $state(false);
    let toolbarIsHovered = $state(false);
    let toolbarShouldAutoHide = $derived(!isFrozen && !toolbarIsHovered);
    let hideToolbarTimeout: NodeJS.Timeout | undefined = undefined;

    // Image state management
    let imgWidth = $state(0);
    let imgHeight = $state(0);
    let panzoom: PanZoom;
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
        }, HIDE_TOOLBAR_TIMEOUT_DURATION);
    }

    // Prevent any further interaction with the UI
    function freeze() {
        isFrozen = true;
        drawingSession.pause();
        showToolbar();
    }

    function unfreeze() {
        isFrozen = false;
        drawingSession.resume();
    }

    const panzoomAttachment: Attachment = (element) => {
        const node = element as HTMLElement | SVGElement;
        panzoom = createPanZoom(node, {
            bounds: true,
            maxZoom: 10,
            minZoom: 0.1,
            smoothScroll: false,
            filterKey: () => true,
        });
        return () => {
            panzoom.dispose();
        };
    };

    // From panzoom/index.js
    function getScaleMultiplier(delta: number) {
        const sign = Math.sign(delta);
        const deltaAdjustedSpeed = Math.min(
            0.25,
            Math.abs((panzoom.getZoomSpeed() * delta) / 1.28),
        );
        return 1 - sign * deltaAdjustedSpeed;
    }

    const prevBtn = {
        key: "prev",
        icon: "lucide--arrow-left",
        action: drawingSession.goPrevImg,
        hotkey: "ArrowLeft",
        tooltip: "Previous image",
    };
    const nextBtn = {
        key: "next",
        icon: "lucide--arrow-right",
        action: drawingSession.goNextImg,
        hotkey: "ArrowRight",
        tooltip: "Next image",
    };
    const pauseBtn = $derived({
        key: "pause",
        icon: drawingSession.isPaused ? "lucide--play" : "lucide--pause",
        action: () => {
            drawingSession.togglePause();
            showToolbar();
        },
        hotkey: " ",
        tooltip: drawingSession.isPaused ? "Resume" : "Pause",
    });
    const exitBtn = {
        key: "exit",
        icon: "lucide--log-out",
        action: () => confirmExitDialog.open(),
        hotkey: "Escape",
        class: "btn-error",
        tooltip: "Exit session",
    };
    const resetZoomBtn = {
        key: "reset-zoom",
        icon: "lucide--scan",
        action: () => {
            panzoom.moveTo(0, 0);
            panzoom.zoomAbs(0, 0, 1);
        },
        hotkey: "0",
        class: "btn-accent",
        tooltip: "Reset zoom",
    };
    const zoomOutBtn = {
        key: "zoom-out",
        icon: "lucide--zoom-out",
        action: () => panzoom.zoomTo(imgWidth / 2, imgHeight / 2, getScaleMultiplier(1)),
        hotkey: "-",
        class: "btn-accent",
        tooltip: "Zoom out",
    };
    const zoomInBtn = {
        key: "zoom-in",
        icon: "lucide--zoom-in",
        action: () => panzoom.zoomTo(imgWidth / 2, imgHeight / 2, getScaleMultiplier(-1)),
        hotkey: "=",
        class: "btn-accent",
        tooltip: "Zoom in",
    };
    const flipHorizontalBtn = $derived({
        key: "flip-horizontal",
        icon: "lucide--flip-horizontal-2",
        action: () => (isFlippedHorizontal = !isFlippedHorizontal),
        hotkey: "f",
        class: ["btn-primary", isFlippedHorizontal ? "btn-active" : ""],
        tooltip: "Flip horizontally",
    });
    const flipVerticalBtn = $derived({
        key: "flip-vertical",
        icon: "lucide--flip-vertical-2",
        action: () => (isFlippedVertical = !isFlippedVertical),
        hotkey: "F",
        class: ["btn-primary", isFlippedVertical ? "btn-active" : ""],
        tooltip: "Flip vertically",
    });
    const greyscaleBtn = $derived({
        key: "greyscale",
        icon: "lucide--blend",
        action: () => (isGreyscale = !isGreyscale),
        hotkey: "g",
        class: ["btn-secondary", isGreyscale ? "btn-active" : ""],
        tooltip: "Greyscale",
    });
    const blurBtn = $derived({
        key: "blur",
        icon: "lucide--droplet",
        action: () => (isBlurred = !isBlurred),
        pressed: isBlurred,
        hotkey: "b",
        class: ["btn-secondary", isBlurred ? "btn-active" : ""],
        tooltip: "Blur",
    });
    const highContrastBtn = $derived({
        key: "high-contrast",
        icon: "lucide--contrast",
        action: () => (isHighContrast = !isHighContrast),
        hotkey: "c",
        class: ["btn-secondary", isHighContrast ? "btn-active" : ""],
        tooltip: "High contrast",
    });
    const hideTimerBtn = $derived({
        key: "hide-timer",
        icon: "lucide--timer-off",
        action: () => (timerShown = !timerShown),
        hotkey: "t",
        class: ["btn-info", !timerShown ? "btn-active" : ""],
        tooltip: timerShown ? "Hide timer" : "Show timer",
    });
    const alwaysOnTopBtn = $derived({
        key: "always-on-top",
        icon: "lucide--pin",
        action: toggleAlwaysOnTop,
        class: ["btn-info", isAlwaysOnTop ? "btn-active" : ""],
        tooltip: isAlwaysOnTop ? "Unpin window" : "Pin window to top",
    });
    const showImageFolderBtn = {
        key: "show-image-folder",
        icon: "lucide--folder-open",
        action: showImageFolder,
        class: "btn-info",
        tooltip: "Show image folder",
    };
    const settingsBtn = {
        key: "settings",
        icon: "lucide--settings",
        action: () => appSettingsDialog.component?.open(),
        tooltip: "Settings",
    };
    const toolsets = $derived([
        [prevBtn, pauseBtn, nextBtn],
        [resetZoomBtn, zoomOutBtn, zoomInBtn],
        [flipHorizontalBtn, flipVerticalBtn, greyscaleBtn, highContrastBtn, blurBtn],
        [hideTimerBtn, alwaysOnTopBtn, showImageFolderBtn],
        [settingsBtn, exitBtn],
    ]);

    onMount(() => {
        resetToolbarTimeout();
        appSettingsDialog.component?.setOnOpen(freeze);
        appSettingsDialog.component?.setOnClose(unfreeze);
    });

    onDestroy(() => {
        clearTimeout(hideToolbarTimeout);
        appSettingsDialog.component?.setOnOpen(() => {});
        appSettingsDialog.component?.setOnClose(() => {});
    });
</script>

<svelte:body onmousemove={showToolbar} onmouseleave={hideToolbar} />

<main class="flex h-dvh items-center-safe justify-center-safe">
    <Background />
    <!-- Wrap image in container so panzoom mouse events only fire on the image -->
    <div class="size-full">
        <!-- Wrap in another container so flipping works correctly -->
        <div class="size-full" {@attach panzoomAttachment}>
            <img
                src={drawingSession.getCurImg().url}
                alt="Reference used for drawing practice"
                class={[
                    "size-full object-contain",
                    isFlippedVertical ? "rotate-x-180" : "",
                    isFlippedHorizontal ? "rotate-y-180" : "",
                    isGreyscale ? "grayscale" : "",
                    isHighContrast ? contrastOptions[appSettings.contrastStrength] : "",
                    isBlurred ? blurOptions[appSettings.blurStrength] : "",
                ]}
                bind:clientWidth={imgWidth}
                bind:clientHeight={imgHeight}
            />
        </div>
    </div>
    <div class="toast toast-top toast-start {TOOLBAR_TRANSITION} {toolbarShown ? '' : 'opacity-0'}">
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
                <span class="iconify lucide--circle-check"></span>{drawingSession.nCompletedImgs}
            </StatusAlert>
            {#snippet tooltipContent()}Images completed{/snippet}
        </Tooltip>
    </div>
    <div class="toast toast-top toast-end items-end">
        {#if timerShown}
            <Tooltip side="left">
                <Timer
                    time={drawingSession.timeRemaining}
                    maxTime={drawingSession.imgShowTime}
                    class={drawingSession.isPaused ? "text-muted!" : ""}
                />
                {#snippet tooltipContent()}Time remaining{/snippet}
            </Tooltip>
        {/if}
        {#if drawingSession.isPaused}
            <StatusAlert class="alert-error">
                <span class="iconify lucide--pause"></span>Paused
            </StatusAlert>
        {/if}
    </div>
    <div
        class="fixed bottom-0 mb-4 flex w-full justify-center-safe space-x-4 overflow-auto transition-all {TOOLBAR_TRANSITION}
               {toolbarShown ? '' : 'opacity-0'}"
        onfocusin={showToolbar}
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
