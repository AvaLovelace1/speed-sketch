<script lang="ts">
    import { Button } from "bits-ui";
    import { formatTimeHuman } from "$lib/utils.svelte";
    import Card from "$lib/components/Card.svelte";

    interface Props {
        nCompletedImgs: number;
        timeSpent: number;
    }

    const { nCompletedImgs, timeSpent }: Props = $props();

    const stats = $derived([
        {
            title: "Images completed",
            value: nCompletedImgs,
            icon: "lucide--image",
            color: "text-primary",
        },
        {
            title: "Time spent drawing",
            value: formatTimeHuman(timeSpent, true),
            icon: "lucide--clock",
            color: "text-secondary",
        },
    ]);
</script>

<main class="bg-base-100 flex min-h-dvh items-center justify-center bg-(image:--fx-noise)">
    <Card>
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
    </Card>
</main>
