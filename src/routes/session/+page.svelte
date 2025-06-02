<script lang="ts">
    import {fade} from 'svelte/transition';

    let showControls = $state(false);
    let hideControlsTimeout: NodeJS.Timeout | undefined = undefined;
    let isPaused = $state(false);

    const initialTime = 70;

    let timeRemaining = $state(initialTime);
    let hoursRemaining = $derived(Math.floor(timeRemaining / 3600));
    let minutesRemaining = $derived(Math.floor((timeRemaining % 3600) / 60));
    let secondsRemaining = $derived(timeRemaining % 60);
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
            else if (timeRemaining === 0) {
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

<div role="main" class="flex flex-col min-h-dvh items-center justify-center"
     onmousemove={doShowControls} onmouseleave={doHideControls}>
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
        <div role="timer" class="absolute toast toast-top toast-end" title="Time remaining">
            <div class="alert alert-soft shadow-sm p-2 flex">
                <span class="countdown font-mono">⏲&nbsp;
                    {#if hoursRemaining}
                    <span style="--value:{hoursRemaining};" aria-live="polite"
                          aria-label="{hoursRemaining.toString()}">{hoursRemaining}</span> :
                    {/if}
                    <span style="--value:{minutesRemaining};" aria-live="polite"
                          aria-label="{minutesRemaining.toString()}">{minutesRemaining}</span> :
                    <span style="--value:{secondsRemaining};" aria-live="polite"
                          aria-label={secondsRemaining.toString()}>{secondsRemaining}</span>
                </span>
            </div>
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

