import { describe, test, expect } from "vitest";
import { appSettings, loadAppSettings, saveAppSettings } from "$lib/store/app-settings.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

describe("app-settings.svelte.ts", () => {
    test("saveAppSettings and loadAppSettings", async () => {
        const persistentStore = createMapStore();

        // Save app settings
        const desiredTheme = "light";
        appSettings.theme = desiredTheme;
        await saveAppSettings(persistentStore);

        appSettings.theme = "dark"; // Change to a different setting

        // Load app settings
        await loadAppSettings(persistentStore);
        expect(appSettings.theme).toBe(desiredTheme);
    });

    test("loading before settings are set does nothing", async () => {
        const persistentStore = createMapStore();

        const desiredTheme = "light";
        appSettings.theme = desiredTheme;
        await loadAppSettings(persistentStore);
        expect(appSettings.theme).toBe(desiredTheme);
    });
});
