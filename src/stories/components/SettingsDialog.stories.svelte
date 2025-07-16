<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";

    const { Story } = defineMeta({
        title: "Components/SettingsDialog",
        component: SettingsDialog,
        tags: ["autodocs"],
    });

    let settingsDialog: SettingsDialog;
</script>

<!-- User settings dialog. -->
<Story name="SettingsDialog">
    {#snippet template(args)}
        <button class="btn" onclick={() => settingsDialog.open()}>Settings</button>
        <SettingsDialog bind:this={settingsDialog} {...args} />
    {/snippet}
</Story>
