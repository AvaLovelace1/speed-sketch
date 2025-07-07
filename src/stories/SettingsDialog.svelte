<script lang="ts">
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";

    const props = $props();

    let settingsDialog: SettingsDialog;
</script>

<button class="btn" onclick={() => settingsDialog.open()}>Settings</button>

<SettingsDialog bind:this={settingsDialog} {...props} />
