<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import { appSettings, appSettingsDialog } from "$lib/store/app-settings.svelte.js";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
    import "../app.css";

    const DESCRIPTION =
        "Create timed drawing sessions using photo references on your own computer. Perfect for gesture studies!";
    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", appSettings.theme);
    });
</script>

<svelte:head>
    <meta name="description" content={DESCRIPTION} />

    <meta property="og:title" content="SpeedSketch" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://avalovelace1.github.io/speed-sketch/" />
    <meta property="og:description" content={DESCRIPTION} />
</svelte:head>

<Tooltip.Provider>
    {@render children()}
    <SettingsDialog bind:this={appSettingsDialog.component} />
</Tooltip.Provider>
