<script lang="ts">
    import { statsDialog } from "$lib/store/stats.svelte";
    import CornerButton from "$lib/components/CornerButton.svelte";
</script>

<CornerButton
    name="Stats"
    icon="lucide--chart-column"
    onclick={() => statsDialog.component?.open()}
    class="top-18"
/>
