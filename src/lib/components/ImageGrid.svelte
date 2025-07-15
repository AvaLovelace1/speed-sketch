<!--
@component
Shows a grid of image thumbnails.
-->
<script lang="ts">
    import type { Image } from "$lib/types.svelte";

    const SQUARE_CLASS =
        "bg-base-100 text-muted flex aspect-square items-center justify-center overflow-hidden rounded shadow-sm";

    interface Props {
        imgs?: Image[];
        isLoading?: boolean;
        maxImgs?: number;
        gridClass?: string;
    }

    const {
        imgs = [],
        isLoading = false,
        maxImgs = 6,
        gridClass = "grid-cols-6 gap-1",
    }: Props = $props();
</script>

{#if isLoading || imgs.length > 0}
    <div class="grid {gridClass}">
        {#if isLoading}
            {#each { length: maxImgs } as _, i (i)}
                <div class={SQUARE_CLASS}>
                    <progress
                        id="loading-{i}"
                        class="loading loading-spinner loading-sm text-stroke-muted size-full"
                    >
                        <label class="sr-only" for="loading-{i}">Loading...</label>
                    </progress>
                </div>
            {/each}
        {:else}
            {#each { length: Math.min(imgs.length, imgs.length > maxImgs ? maxImgs - 1 : maxImgs) } as _, i (i)}
                <!-- Wrapper div required for object-cover images to look good in Firefox -->
                <div class={SQUARE_CLASS}>
                    <img
                        src={imgs[i].url}
                        alt="Thumbnail for {imgs[i].name}"
                        class="size-full object-cover"
                    />
                </div>
            {/each}
            {#if imgs.length > maxImgs}
                <div class={SQUARE_CLASS}>
                    + <span class="text-lg font-semibold">{imgs.length - (maxImgs - 1)}</span>
                </div>
            {/if}
        {/if}
    </div>
{/if}
