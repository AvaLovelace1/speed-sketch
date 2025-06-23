<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
    import { settings } from "$lib/globals.svelte";
    import "../app.css";

    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", settings.theme);
    });
</script>

<Tooltip.Provider>
    {@render children()}
    <SettingsDialog bind:this={settings.dialog} />
</Tooltip.Provider>
