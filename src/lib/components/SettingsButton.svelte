<script lang="ts">
    import { Button } from "bits-ui";
    import { appSettingsDialog } from "$lib/store/app-settings.svelte";
</script>

<Button.Root
    class="btn btn-circle fixed top-4 right-4 size-12 rounded-full text-xl"
    onclick={() => appSettingsDialog.component?.open()}
>
    <span class="iconify lucide--settings"></span>
    <span class="sr-only">Settings</span>
</Button.Root>
