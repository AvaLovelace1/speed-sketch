<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import {fade} from 'svelte/transition';

    let showControls = $state(false);
    let hideControlsTimeout: NodeJS.Timeout | undefined = undefined;

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
</script>

<div role="main" class="fixed inset-0 flex flex-col items-center justify-center"
     onmousemove={doShowControls} onmouseleave={doHideControls}>
    <div class="relative max-w-full max-h-full flex">
        <img src="example.png" alt="Reference used for drawing practice" class="max-w-full max-h-full"/>
        {#if showControls}
            <div role="status" class="absolute toast toast-top toast-start" title="Images completed"
                 transition:fade={{duration: 150}}>
                <div class="alert alert-soft shadow-sm p-2">☑ 11</div>
            </div>
        {/if}
        <div role="timer" class="absolute toast toast-top toast-end" title="Time remaining">
            <div class="alert alert-soft shadow-sm p-2">⏲ 9:45</div>
        </div>
    </div>
    {#if showControls}
        <div class="fixed bottom-0 w-full shadow-sm flex flex-row justify-center p-4"
             transition:fade={{duration: 150}}>
            <div class="join rounded shadow-sm">
                <Button label="← PREV" class_="join-item btn-soft btn-primary"/>
                <Button label="NEXT →" class_="join-item btn-soft btn-primary"/>
                <Button label="PAUSE ⏸" class_="join-item btn-soft btn-warning"/>
                <Button label="EXIT Ⓧ" class_="join-item btn-soft btn-error"/>
            </div>
        </div>
    {/if}
</div>

