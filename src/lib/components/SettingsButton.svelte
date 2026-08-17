<script lang="ts">
    import { appSettingsDialog } from "$lib/store/app-settings.svelte";
    import CornerButton from "$lib/components/CornerButton.svelte";
</script>

<CornerButton
    name="Settings"
    icon="lucide--settings"
    onclick={() => appSettingsDialog.component?.open()}
    class="top-4"
/>
