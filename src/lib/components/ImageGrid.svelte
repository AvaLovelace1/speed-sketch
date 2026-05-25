<!--
@component
Shows a grid of image thumbnails.
-->
<script lang="ts">
    import type { Image } from "$lib/types.svelte";

    const TILE_CLASS =
        "bg-base-100 text-muted flex aspect-square items-center justify-center overflow-hidden rounded shadow-sm";

    interface Props {
        imgs?: Image[];
        isLoading?: boolean;
        maxImgs?: number;
        gridClass?: string;
        moreTileClass?: string;
    }

    const {
        imgs = [],
        isLoading = false,
        maxImgs = 8,
        gridClass = "",
        moreTileClass = "",
    }: Props = $props();

    // Workaround for bug https://youtrack.jetbrains.com/issue/WEB-61819/Svelte-5-TypeScript-in-markup-expressions
    type StringType = string;
    type NumberType = number;
</script>

{#if isLoading || imgs.length > 0}
    <div class="grid {gridClass}">
        {#if isLoading}
            {#each { length: maxImgs } as _, i (i)}
                {@render loadingTile(i.toString())}
            {/each}
        {:else}
            {#each { length: Math.min(imgs.length, imgs.length > maxImgs ? maxImgs - 1 : maxImgs) } as _, i (i)}
                {@render imgTile(imgs[i])}
            {/each}
            {#if imgs.length > maxImgs}
                {@render moreTile(imgs.length - (maxImgs - 1))}
            {/if}
        {/if}
    </div>
{/if}

{#snippet imgTile(img: Image)}
    <!-- Wrapper div required for object-cover images to look good in Firefox -->
    <div class={TILE_CLASS}>
        {#if img.isVideo}
            <!-- #t=0.001 ensures the video thumbnail displays in Safari -->
            <video
                src="{img.url}#t=0.001"
                muted
                playsinline
                preload="metadata"
                class="size-full object-cover"
            >
                Thumbnail for video {img.name}
            </video>
        {:else}
            <img src={img.url} alt="Thumbnail for {img.name}" class="size-full object-cover" />
        {/if}
    </div>
{/snippet}

{#snippet moreTile(count: NumberType)}
    <div class={[TILE_CLASS, moreTileClass]}>
        + <span class="text-lg font-semibold">{count}</span>
    </div>
{/snippet}

{#snippet loadingTile(id: StringType)}
    <div class={TILE_CLASS}>
        <span id="loading-label-{id}" class="sr-only">Loading...</span>
        <span
            role="progressbar"
            aria-labelledby="loading-label-{id}"
            class="loading loading-sm loading-spinner text-stroke"
        ></span>
    </div>
{/snippet}
