<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
    import { settings } from "$lib/globals.svelte";
    import "../app.css";
    import { load } from "@tauri-apps/plugin-store";

    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", settings.theme);
    });

    async function saveSettings() {
        try {
            const persistentStore = await load("store.json", { autoSave: false });
            for (const key in settings) {
                await persistentStore.set(key, settings[key]);
            }
            await persistentStore.save();
        } catch (e) {
            console.error("Failed to save session settings:", e);
        }
    }
</script>

<Tooltip.Provider>
    {@render children()}
    <SettingsDialog bind:this={settings.dialog} onClose={saveSettings} />
</Tooltip.Provider>
