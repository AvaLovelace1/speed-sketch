<!--
@component
Shows a grid of image thumbnails.
-->
<script lang="ts">
    import type { Image } from "$lib/types.svelte";

    const SHADOW = "shadow-sm";

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
    <div role="status" class={["text-muted mb-2 text-xs", isLoading ? "" : "invisible"]}>
        Loading images...
    </div>
    <div class="grid {gridClass}">
        {#if isLoading}
            {#each { length: maxImgs } as _, i (i)}
                <div class="bg-base-100 aspect-square animate-pulse rounded {SHADOW}"></div>
            {/each}
        {:else}
            {#each { length: Math.min(imgs.length, imgs.length > maxImgs ? maxImgs - 1 : maxImgs) } as _, i (i)}
                <img
                    src={imgs[i].url}
                    alt="Thumbnail for {imgs[i].name}"
                    class="aspect-square rounded object-cover {SHADOW}"
                />
            {/each}
            {#if imgs.length > maxImgs}
                <div
                    class="bg-base-100 text-muted flex aspect-square items-center justify-center rounded {SHADOW}"
                >
                    + <span class="text-lg font-semibold">{imgs.length - (maxImgs - 1)}</span>
                </div>
            {/if}
        {/if}
    </div>
{/if}
