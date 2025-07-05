<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import { isTauri } from "@tauri-apps/api/core";
    import { listen } from "@tauri-apps/api/event";
    import { appSettings, appSettingsDialog } from "$lib/store/app-settings.svelte.js";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
    import "../app.css";

    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", appSettings.theme);
    });

    if (isTauri()) listen("do-open-settings", (_) => appSettingsDialog.component?.open());
</script>

<svelte:head>
    <meta
        name="description"
        content="Create timed drawing sessions using photo references on your own computer. Perfect for gesture studies!"
    />
</svelte:head>

<Tooltip.Provider>
    {@render children()}
    <SettingsDialog bind:this={appSettingsDialog.component} />
</Tooltip.Provider>
