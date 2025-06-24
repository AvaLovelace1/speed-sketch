<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
    import "../app.css";
    import { load } from "@tauri-apps/plugin-store";
    import { appSettings } from "$lib/app-settings.svelte";

    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", appSettings.theme);
    });

    async function saveSettings() {
        try {
            const persistentStore = await load("store.json", { autoSave: false });
            for (const key in appSettings) {
                await persistentStore.set(key, appSettings[key]);
            }
            await persistentStore.save();
        } catch (e) {
            console.error("Failed to save session settings:", e);
        }
    }
</script>

<Tooltip.Provider>
    {@render children()}
    <SettingsDialog bind:this={appSettings.dialog} onClose={saveSettings} />
</Tooltip.Provider>
