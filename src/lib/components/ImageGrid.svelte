<!--
@component
Shows a grid of image thumbnails.
-->
<script lang="ts">
    const N_COLS = 6;
    const SHADOW = "shadow-sm";

    interface Props {
        imgUrls?: string[];
        isLoading?: boolean;
    }
    const { imgUrls = [], isLoading = false }: Props = $props();
</script>

{#if isLoading || imgUrls.length > 0}
    <div class="text-muted mb-2 text-xs {isLoading ? '' : 'invisible'}">Loading images...</div>
    <div class="grid grid-cols-6 gap-1">
        {#if isLoading}
            {#each { length: N_COLS } as _, i (i)}
                <div class="bg-base-100 aspect-square animate-pulse rounded {SHADOW}"></div>
            {/each}
        {:else}
            {#each { length: Math.min(imgUrls.length, imgUrls.length > N_COLS ? N_COLS - 1 : N_COLS) } as _, i (i)}
                <img
                    src={imgUrls[i]}
                    alt="Thumbnail {i}"
                    class="aspect-square rounded object-cover {SHADOW}"
                />
            {/each}
            {#if imgUrls.length > N_COLS}
                <div
                    class="bg-base-100 text-muted flex aspect-square items-center justify-center rounded {SHADOW}"
                >
                    + <span class="text-lg font-semibold">{imgUrls.length - (N_COLS - 1)}</span>
                </div>
            {/if}
        {/if}
    </div>
{/if}
