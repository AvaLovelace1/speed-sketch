<script lang="ts">
    import {fade} from 'svelte/transition';
    import Timer from "$lib/components/Timer.svelte";

    let showControls = $state(false);
    let hideControlsTimeout: NodeJS.Timeout | undefined = undefined;
    let isPaused = $state(false);

    const initialTime = 70;

    let timeRemaining = $state(initialTime);
    let timerInterval: NodeJS.Timeout | undefined = undefined;

    let nCompleted = $state(0);

    const doShowControls = () => {
        showControls = true;
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            showControls = false;
        }, 3000);
    }

    const doHideControls = () => {
        showControls = false;
        clearTimeout(hideControlsTimeout);
    }

    const doPause = () => {
        isPaused = true;
        clearInterval(timerInterval);
        doShowControls();
    }

    const doResume = () => {
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

    doResume();
</script>

<svelte:window onkeydown={onKeyDown}/>

<svelte:body onmousemove={doShowControls} onmouseleave={doHideControls}/>

<div role="main" class="flex flex-col min-h-dvh items-center justify-center">
    <div class="relative">
        <img src="example.png" alt="Reference used for drawing practice" class="max-w-dvw max-h-dvh"/>
        {#if showControls}
            <div role="status" class="absolute toast toast-top toast-start" title="Images completed"
                 transition:fade={{duration: 150}}>
                <div class="alert alert-soft shadow-sm p-2 font-mono flex">
                    <span class="font-mono">☑&nbsp;{nCompleted}</span>
                </div>
            </div>
        {/if}
        <div class="absolute toast toast-top toast-end" title="Time remaining">
            <Timer time={timeRemaining}/>
        </div>
    </div>
    {#if showControls}
        <div class="fixed bottom-0 w-full shadow-sm flex flex-row justify-center p-4"
             transition:fade={{duration: 150}}>
            <div class="join rounded shadow-sm">
                <button type="button" class="btn join-item btn-soft btn-primary" title="Previous image (left arrow)">
                    ← PREV
                </button>
                <button type="button" class="btn join-item btn-soft btn-primary" title="Next image (right arrow)">
                    NEXT →
                </button>
                {#if isPaused}
                    <button type="button" class="btn join-item btn-soft btn-success"
                            title="Resume session (space)" onclick={() => isPaused = false}>
                        RESUME ▶
                    </button>
                {:else}
                    <button type="button" class="btn join-item btn-soft btn-warning"
                            title="Pause session (space)" onclick={() => isPaused = true}>
                        PAUSE ⏸
                    </button>
                {/if}
                <a href="/" role="button" class="btn join-item btn-soft btn-error" title="Exit (esc)">
                    EXIT Ⓧ
                </a>
            </div>
        </div>
    {/if}
</div>

