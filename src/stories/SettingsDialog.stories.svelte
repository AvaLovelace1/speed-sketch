<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import SettingsDialog from "./SettingsDialog.svelte";

    const { Story } = defineMeta({
        title: "SettingsDialog",
        component: SettingsDialog,
        tags: ["autodocs"],
    });
</script>

<!-- User settings dialog. -->
<Story name="SettingsDialog" />
