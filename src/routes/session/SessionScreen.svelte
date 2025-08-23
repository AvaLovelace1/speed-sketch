<!--
@component
The user interface for a drawing session.
-->
<script lang="ts">
    import type { Attachment } from "svelte/attachments";
    import createPanZoom, { type PanZoom } from "panzoom";
    import { appSettings, appSettingsDialog } from "$lib/store/app-settings.svelte.js";
    import CenteredFull from "$lib/utilities/CenteredFull.svelte";
    import AlertDialog from "$lib/components/dialog/AlertDialog.svelte";
    import Timer from "$lib/components/Timer.svelte";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import type { Tool } from "$lib/components/Toolbar.svelte";
    import { Tooltip } from "bits-ui";
    import CustomTooltip from "$lib/components/Tooltip.svelte";
    import StatusAlert from "$lib/components/StatusAlert.svelte";
    import { onDestroy, onMount } from "svelte";
    import type { DrawingSession } from "$lib/drawing-session.svelte";

    const TOOLBAR_TRANSITION = "duration-300 ease-out";
    export interface Props {
        drawingSession: DrawingSession;
        exit?: () => void;
        setAlwaysOnTop?: ((value: boolean) => Promise<void>) | null;
        showImageFolder?: (() => Promise<void>) | null;
        // Whether to wrap in a Tooltip.Provider (necessary if ancestor is not already wrapped)
        includeTooltipProvider?: boolean;
        // Duration after which toolbar will be hidden automatically
        hideToolbarTimeoutDuration?: number;
    }

    const {
        drawingSession,
        exit = () => {},
        setAlwaysOnTop = null,
        showImageFolder = null,
        includeTooltipProvider = false,
        hideToolbarTimeoutDuration = 3000,
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
    let isAlwaysOnTop = $state(false);

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

    export function toolbarIsShown() {
        return toolbarShown;
    }

    function resetToolbarTimeout() {
        clearTimeout(hideToolbarTimeout);
        hideToolbarTimeout = setTimeout(() => {
            if (toolbarShouldAutoHide) hideToolbar();
            else resetToolbarTimeout();
        }, hideToolbarTimeoutDuration);
    }

    // Prevent any further interaction with the UI
    export function freeze() {
        isFrozen = true;
        drawingSession.pause();
        showToolbar();
    }

    export function unfreeze() {
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

    // For testing purposes only.
    export function getImgTransform() {
        return panzoom.getTransform();
    }

    const prevBtn: Tool = $derived({
        uid: "prev",
        icon: "lucide--arrow-left",
        action: drawingSession.goPrevImg,
        hotkey: "ArrowLeft",
        tooltip: "Previous image",
        disabled: isFrozen,
    });
    const nextBtn: Tool = $derived({
        uid: "next",
        icon: "lucide--arrow-right",
        action: drawingSession.goNextImg,
        hotkey: "ArrowRight",
        tooltip: "Next image",
        disabled: isFrozen,
    });
    const pauseBtn: Tool = $derived({
        uid: "pause",
        icon: drawingSession.isPaused ? "lucide--play" : "lucide--pause",
        action: () => {
            drawingSession.togglePause();
            showToolbar();
        },
        hotkey: " ",
        tooltip: drawingSession.isPaused ? "Resume" : "Pause",
        disabled: isFrozen,
    });
    const resetZoomBtn: Tool = $derived({
        uid: "reset-zoom",
        icon: "lucide--scan",
        action: () => {
            panzoom.moveTo(0, 0);
            panzoom.zoomAbs(0, 0, 1);
        },
        hotkey: "0",
        class: "btn-accent",
        tooltip: "Reset zoom",
        disabled: isFrozen,
    });
    const zoomOutBtn: Tool = $derived({
        uid: "zoom-out",
        icon: "lucide--zoom-out",
        action: () => panzoom.zoomTo(imgWidth / 2, imgHeight / 2, getScaleMultiplier(1)),
        hotkey: "-",
        class: "btn-accent",
        tooltip: "Zoom out",
        disabled: isFrozen,
    });
    const zoomInBtn: Tool = $derived({
        uid: "zoom-in",
        icon: "lucide--zoom-in",
        action: () => panzoom.zoomTo(imgWidth / 2, imgHeight / 2, getScaleMultiplier(-1)),
        hotkey: "=",
        class: "btn-accent",
        tooltip: "Zoom in",
        disabled: isFrozen,
    });
    const flipHorizontalBtn: Tool = $derived({
        uid: "flip-horizontal",
        icon: "lucide--flip-horizontal-2",
        action: () => (isFlippedHorizontal = !isFlippedHorizontal),
        hotkey: "f",
        class: ["btn-primary", isFlippedHorizontal && "btn-active"],
        tooltip: "Flip horizontally",
        disabled: isFrozen,
    });
    const flipVerticalBtn: Tool = $derived({
        uid: "flip-vertical",
        icon: "lucide--flip-vertical-2",
        action: () => (isFlippedVertical = !isFlippedVertical),
        hotkey: "F",
        class: ["btn-primary", isFlippedVertical && "btn-active"],
        tooltip: "Flip vertically",
        disabled: isFrozen,
    });
    const greyscaleBtn: Tool = $derived({
        uid: "greyscale",
        icon: "lucide--blend",
        action: () => (isGreyscale = !isGreyscale),
        hotkey: "g",
        class: ["btn-secondary", isGreyscale && "btn-active"],
        tooltip: "Greyscale",
        disabled: isFrozen,
    });
    const blurBtn: Tool = $derived({
        uid: "blur",
        icon: "lucide--droplet",
        action: () => (isBlurred = !isBlurred),
        pressed: isBlurred,
        hotkey: "b",
        class: ["btn-secondary", isBlurred && "btn-active"],
        tooltip: "Blur",
        disabled: isFrozen,
    });
    const highContrastBtn: Tool = $derived({
        uid: "high-contrast",
        icon: "lucide--contrast",
        action: () => (isHighContrast = !isHighContrast),
        hotkey: "c",
        class: ["btn-secondary", isHighContrast && "btn-active"],
        tooltip: "High contrast",
        disabled: isFrozen,
    });
    const hideTimerBtn: Tool = $derived({
        uid: "hide-timer",
        icon: "lucide--timer-off",
        action: () => (timerShown = !timerShown),
        hotkey: "t",
        class: ["btn-info", !timerShown && "btn-active"],
        tooltip: timerShown ? "Hide timer" : "Show timer",
        disabled: isFrozen,
    });
    const alwaysOnTopBtn: Tool = $derived({
        uid: "always-on-top",
        icon: "lucide--pin",
        action: setAlwaysOnTop
            ? async () => {
                  try {
                      await setAlwaysOnTop(!isAlwaysOnTop);
                      isAlwaysOnTop = !isAlwaysOnTop;
                  } catch (e) {
                      console.error("Failed to toggle always on top:", e);
                  }
              }
            : () => {},
        hotkey: "",
        class: ["btn-info", isAlwaysOnTop && "btn-active"],
        tooltip: isAlwaysOnTop ? "Unpin window" : "Pin window to top",
        disabled: isFrozen,
    });
    const showImageFolderBtn: Tool = $derived({
        uid: "show-image-folder",
        icon: "lucide--folder-open",
        action: showImageFolder ? showImageFolder : () => {},
        hotkey: "",
        class: "btn-info",
        tooltip: "Show image folder",
        disabled: isFrozen,
    });
    const settingsBtn: Tool = $derived({
        uid: "settings",
        icon: "lucide--settings",
        action: () => appSettingsDialog.component?.open(),
        tooltip: "Settings",
        disabled: isFrozen,
    });
    const exitBtn: Tool = $derived({
        uid: "exit",
        icon: "lucide--log-out",
        action: () => confirmExitDialog.open(),
        hotkey: "Escape",
        class: "btn-error",
        tooltip: "Exit session",
        disabled: isFrozen,
    });
    const toolsets = $derived([
        [prevBtn, pauseBtn, nextBtn],
        [resetZoomBtn, zoomOutBtn, zoomInBtn],
        [flipHorizontalBtn, flipVerticalBtn, greyscaleBtn, highContrastBtn, blurBtn],
        [hideTimerBtn]
            .concat(setAlwaysOnTop ? [alwaysOnTopBtn] : [])
            .concat(showImageFolder ? [showImageFolderBtn] : []),
        [settingsBtn, exitBtn],
    ]);

    $effect(() => {
        if (drawingSession.isFinished) exit();
    });

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

{#snippet main()}
    <CenteredFull tag="main">
        {@render image()}
        {@render statusAlerts()}
        {@render toolbar()}
    </CenteredFull>

    <AlertDialog
        bind:this={confirmExitDialog}
        title="Exit session?"
        description="This will end the current session"
        cancelText="Stay"
        confirmText="Exit"
        onOpen={freeze}
        onCancel={unfreeze}
        onConfirm={exit}
    />
{/snippet}

{#snippet image()}
    <!-- Wrap image in container so panzoom mouse events only fire on the image -->
    <div class="size-full">
        <!-- Wrap in another container so flipping works correctly -->
        <div class="size-full" {@attach panzoomAttachment}>
            <img
                src={drawingSession.getCurImg().url}
                alt="Reference used for drawing practice"
                class={[
                    "size-full object-contain",
                    isFlippedVertical && "-scale-y-100",
                    isFlippedHorizontal && "-scale-x-100",
                    isGreyscale && "grayscale",
                    isHighContrast && appSettings.contrastClass,
                    isBlurred && appSettings.blurClass,
                ]}
                bind:clientWidth={imgWidth}
                bind:clientHeight={imgHeight}
            />
        </div>
    </div>
{/snippet}

{#snippet statusAlerts()}
    <div class="toast-top toast-start toast {TOOLBAR_TRANSITION} {toolbarShown ? '' : 'opacity-0'}">
        <CustomTooltip
            side="right"
            onmouseenter={() => (toolbarIsHovered = true)}
            onmouseleave={() => {
                toolbarIsHovered = false;
                resetToolbarTimeout();
            }}
        >
            <StatusAlert class="alert-success tabular-nums">
                <span class="iconify lucide--image"></span>
                <span class="sr-only">Images completed:</span>
                <div>
                    {drawingSession.nCompletedImgs}
                    {#if drawingSession.totalImgs !== Infinity}
                        <span class="text-base font-normal">/ {drawingSession.totalImgs}</span>
                    {/if}
                </div>
            </StatusAlert>
            {#snippet tooltipContent()}Images completed{/snippet}
        </CustomTooltip>
    </div>
    <div class="toast-top toast-end toast items-end">
        {#if timerShown}
            <CustomTooltip side="left">
                <Timer
                    time={drawingSession.timeRemaining}
                    maxTime={drawingSession.getCurScheduleEntry().duration}
                    class={[drawingSession.isPaused && "text-muted!"]}
                />
                {#snippet tooltipContent()}Time remaining{/snippet}
            </CustomTooltip>
        {/if}
        {#if drawingSession.isPaused}
            <StatusAlert class="alert-error">
                <span class="iconify lucide--pause"></span>Paused
            </StatusAlert>
        {/if}
    </div>
{/snippet}

{#snippet toolbar()}
    <div
        class="fixed bottom-0 flex w-full justify-center-safe space-x-4 overflow-auto px-2 py-4 transition-all {TOOLBAR_TRANSITION}
               {toolbarShown ? '' : 'opacity-0'}"
        onfocusin={showToolbar}
    >
        {#each toolsets as tools, i (i)}
            <Toolbar
                {tools}
                onmouseenter={() => (toolbarIsHovered = true)}
                onmouseleave={() => {
                    toolbarIsHovered = false;
                    resetToolbarTimeout();
                }}
            />
        {/each}
    </div>
{/snippet}

{#if includeTooltipProvider}
    <Tooltip.Provider>
        {@render main()}
    </Tooltip.Provider>
{:else}
    {@render main()}
{/if}
