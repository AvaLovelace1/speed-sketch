import { describe, test as base, expect } from "vitest";
import { AppSettings } from "./app-settings.svelte";
import { createMapStore, type PersistentStore } from "$lib/store/persistent-store.svelte";

interface AppSettingsFixture {
    fixture: {
        appSettings: AppSettings;
        persistentStore: PersistentStore;
    };
}

const test = base.extend<AppSettingsFixture>({
    fixture: async ({ task: _task }, use) => {
        const persistentStore = createMapStore();
        const appSettings = new AppSettings();
        await use({ appSettings, persistentStore });
    },
});

describe("app-settings.svelte.ts", () => {
    test("saveAppSettings and loadAppSettings", async ({
        fixture: { appSettings, persistentStore },
    }) => {
        // Save app settings
        const desiredTheme = "light";
        appSettings.theme = desiredTheme;
        await appSettings.saveToStore(persistentStore);

        appSettings.theme = "dark"; // Change to a different setting

        // Load app settings
        await appSettings.loadFromStore(persistentStore);
        expect(appSettings.theme).toBe(desiredTheme);
    });

    test("loading before settings are set does nothing", async ({
        fixture: { appSettings, persistentStore },
    }) => {
        const desiredTheme = "light";
        appSettings.theme = desiredTheme;
        await appSettings.loadFromStore(persistentStore);
        expect(appSettings.theme).toBe(desiredTheme);
    });

    test("contrastClass and blurClass", ({ fixture: { appSettings } }) => {
        appSettings.contrastStrength = 2;
        appSettings.blurStrength = 3;
        expect(appSettings.contrastClass).toBe(appSettings.CONTRAST_OPTIONS[2]);
        expect(appSettings.blurClass).toBe(appSettings.BLUR_OPTIONS[3]);
    });
});
