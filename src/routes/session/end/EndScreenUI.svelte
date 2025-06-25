<script lang="ts">
    import { Button } from "bits-ui";
    import prettyMilliseconds from "pretty-ms";
    import Card from "$lib/components/Card.svelte";
    import { appSettings } from "$lib/app-settings.svelte";

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
            value: prettyMilliseconds(Math.max(timeSpent, 1) * 1000),
            icon: "lucide--clock",
            color: "text-secondary",
        },
    ]);
</script>

<main class="bg-base-100 flex min-h-dvh items-center justify-center bg-(image:--fx-noise)">
    <Card cardBodyClass="p-8">
        <h1 class="card-title mb-6 text-2xl">Session complete!</h1>
        <div class="stats mb-4">
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
    <Button.Root
        class="btn btn-circle absolute top-4 right-4 size-12 rounded-full text-xl"
        onclick={() => appSettings.dialog?.open()}
    >
        <span class="iconify lucide--settings"></span>
        <span class="sr-only">Settings</span>
    </Button.Root>
</main>
