<script lang="ts">
    import { appSettingsDialog } from "$lib/store/app-settings.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
</script>

<Tooltip
    side="left"
    onclick={() => appSettingsDialog.component?.open()}
    class="btn btn-circle shadow-offblack/10 fixed top-4 right-4 size-12 rounded-full text-xl shadow-sm"
>
    <span class="iconify lucide--settings"><span class="sr-only">Settings</span></span>
    {#snippet tooltipContent()}<p>Settings</p>{/snippet}
</Tooltip>
