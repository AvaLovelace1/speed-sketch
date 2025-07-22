<script lang="ts">
    import { Button, Tooltip } from "bits-ui";
    import prettyMilliseconds from "pretty-ms";
    import CenteredFull from "$lib/utilities/CenteredFull.svelte";
    import Card from "$lib/atoms/Card.svelte";
    import SettingsButton from "$lib/components/SettingsButton.svelte";
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";

    interface Props {
        nCompletedImgs: number;
        timeSpent: number;
        // Whether to wrap in a Tooltip.Provider (necessary if ancestor is not already wrapped)
        includeTooltipProvider?: boolean;
    }

    const { nCompletedImgs, timeSpent, includeTooltipProvider = false }: Props = $props();

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

{#snippet main()}
    <CenteredFull tag="main">
        <div class="px-2 py-8">
            <Card class="p-8">
                <h1 class="mb-6 text-2xl font-semibold">Session complete!</h1>
                <div class="stats mb-6">
                    {#each stats as { title, value, color, icon } (title)}
                        <div class="stat">
                            <div class="stat-figure {color} self-end text-3xl">
                                <span class="iconify {icon}"></span>
                            </div>
                            <div class="stat-title text-muted">{title}</div>
                            <div class="stat-value {color}">{value}</div>
                        </div>
                    {/each}
                </div>
                <div class="flex justify-end">
                    <Button.Root
                        class="btn"
                        onclick={async () => await goto(`${base}/`, { replaceState: true })}
                    >
                        Return to main menu
                    </Button.Root>
                </div>
            </Card>
        </div>
    </CenteredFull>
    <SettingsButton />
{/snippet}

{#if includeTooltipProvider}
    <Tooltip.Provider>
        {@render main()}
    </Tooltip.Provider>
{:else}
    {@render main()}
{/if}
