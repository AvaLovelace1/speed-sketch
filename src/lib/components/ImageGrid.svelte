<!--
@component
Shows a grid of image thumbnails.
-->
<script lang="ts">
    interface Props {
        imgPaths?: string[];
        isLoading?: boolean;
    }

    const { imgPaths = [], isLoading = false }: Props = $props();
    const nCols = 6;
    const shadow = "shadow-sm";
</script>

{#if isLoading || imgPaths.length > 0}
    <div class="text-muted mb-2 text-xs {isLoading ? '' : 'invisible'}">Loading images...</div>
    <div class="grid grid-cols-6 gap-1">
        {#if isLoading}
            {#each { length: nCols } as _, i (i)}
                <div class="bg-base-100 aspect-square animate-pulse rounded {shadow}"></div>
            {/each}
        {:else}
            {#each { length: Math.min(imgPaths.length, imgPaths.length > nCols ? nCols - 1 : nCols) } as _, i (i)}
                <img
                    src={imgPaths[i]}
                    alt="Thumbnail {i}"
                    class="aspect-square rounded object-cover {shadow}"
                />
            {/each}
            {#if imgPaths.length > nCols}
                <div
                    class="bg-base-100 text-muted flex aspect-square items-center justify-center rounded {shadow}"
                >
                    + <span class="text-lg font-bold">{imgPaths.length - (nCols - 1)}</span>
                </div>
            {/if}
        {/if}
    </div>
{/if}
