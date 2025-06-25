<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
    import "../app.css";
    import { getStore } from "$lib/persistent-store.svelte";
    import { appSettings, saveAppSettings } from "$lib/app-settings.svelte";

    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", appSettings.theme);
    });
</script>

<Tooltip.Provider>
    {@render children()}
    <SettingsDialog
        bind:this={appSettings.dialog}
        onClose={async () => {
            await getStore()
                .then(async (store) => {
                    await saveAppSettings(store);
                })
                .catch((e) => {
                    console.error("Failed to load persistent store and save app settings:", e);
                });
        }}
    />
</Tooltip.Provider>
