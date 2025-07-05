<script lang="ts">
    import { Button } from "bits-ui";
    import prettyMilliseconds from "pretty-ms";
    import Card from "$lib/components/Card.svelte";
    import Background from "$lib/components/Background.svelte";
    import SettingsButton from "$lib/components/SettingsButton.svelte";

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

<main class="flex h-dvh items-center-safe justify-center-safe">
    <Background />
    <div class="py-8">
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
    </div>
    <SettingsButton />
</main>
