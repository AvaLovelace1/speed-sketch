<script lang="ts">
    import { appSettingsDialog } from "$lib/store/app-settings.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
</script>

<Tooltip
    side="left"
    onclick={() => appSettingsDialog.component?.open()}
    class="btn fixed top-4 right-4 btn-circle size-12 rounded-full text-xl shadow-sm"
>
    <span class="iconify lucide--settings"></span>
    <span class="sr-only">Settings</span>
    {#snippet tooltipContent()}<p>Settings</p>{/snippet}
</Tooltip>
