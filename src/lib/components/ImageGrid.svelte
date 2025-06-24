<!--
@component
Shows a grid of image thumbnails.
-->
<script lang="ts">
    interface Props {
        imgUrls?: string[];
        isLoading?: boolean;
    }

    const { imgUrls = [], isLoading = false }: Props = $props();
    const nCols = 6;
    const shadow = "shadow-sm";
</script>

{#if isLoading || imgUrls.length > 0}
    <div class="text-muted mb-2 text-xs {isLoading ? '' : 'invisible'}">Loading images...</div>
    <div class="grid grid-cols-6 gap-1">
        {#if isLoading}
            {#each { length: nCols } as _, i (i)}
                <div class="bg-base-100 aspect-square animate-pulse rounded {shadow}"></div>
            {/each}
        {:else}
            {#each { length: Math.min(imgUrls.length, imgUrls.length > nCols ? nCols - 1 : nCols) } as _, i (i)}
                <img
                    src={imgUrls[i]}
                    alt="Thumbnail {i}"
                    class="aspect-square rounded object-cover {shadow}"
                />
            {/each}
            {#if imgUrls.length > nCols}
                <div
                    class="bg-base-100 text-muted flex aspect-square items-center justify-center rounded {shadow}"
                >
                    + <span class="text-lg font-semibold">{imgUrls.length - (nCols - 1)}</span>
                </div>
            {/if}
        {/if}
    </div>
{/if}
