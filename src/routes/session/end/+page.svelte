<script lang="ts">
    import { Button } from "bits-ui";
    import { sessionStore } from "$lib/globals.svelte";
    import { formatTimeHuman } from "$lib/utils.svelte";

    const stats = [
        {
            title: "Images completed",
            value: sessionStore.nCompletedImgs,
            icon: "lucide--image",
            color: "text-primary",
        },
        {
            title: "Time spent drawing",
            value: formatTimeHuman(sessionStore.timeSpent, true),
            icon: "lucide--clock",
            color: "text-secondary",
        },
    ];
</script>

<svelte:head>
    <title>SpeedSketch - session ended</title>
</svelte:head>

<div role="main" class="bg-accent flex min-h-dvh items-center justify-center">
    <div class="card bg-base-100 w-fit shadow-lg">
        <div class="card-body">
            <h1 class="card-title mb-1 text-2xl">Session complete!</h1>
            <div class="stats">
                {#each stats as { title, value, color, icon } (title)}
                    <div class="stat">
                        <div class="stat-figure {color} self-end text-3xl">
                            <span class="iconify {icon}"></span>
                        </div>
                        <div class="stat-title">{title}</div>
                        <div class="stat-value {color}">{value}</div>
                    </div>
                {/each}
            </div>
            <div class="card-actions justify-end">
                <Button.Root class="btn" href="/">Return to Main Menu</Button.Root>
            </div>
        </div>
    </div>
</div>
