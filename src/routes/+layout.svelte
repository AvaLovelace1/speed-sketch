<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import { listen } from "@tauri-apps/api/event";
    import { getStore } from "$lib/persistent-store.svelte";
    import { appSettings, appSettingsDialog, saveAppSettings } from "$lib/app-settings.svelte";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
    import "../app.css";

    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", appSettings.theme);
    });

    listen("do-open-settings", (_) => appSettingsDialog.component?.open());
</script>

<Tooltip.Provider>
    {@render children()}
    <SettingsDialog
        bind:this={appSettingsDialog.component}
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
