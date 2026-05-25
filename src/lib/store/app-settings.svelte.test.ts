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

    test("videoPlaybackRate defaults to 1 and persists", async ({
        fixture: { appSettings, persistentStore },
    }) => {
        expect(appSettings.videoPlaybackRate).toBe(1);
        appSettings.videoPlaybackRate = 1.5;
        await appSettings.saveToStore(persistentStore);

        const loaded = new AppSettings();
        await loaded.loadFromStore(persistentStore);
        expect(loaded.videoPlaybackRate).toBe(1.5);
    });

    test("videoPlaybackRate rejects out-of-range values on load", async ({
        fixture: { persistentStore },
    }) => {
        await persistentStore.set("videoPlaybackRate", 99);
        await persistentStore.save();
        const loaded = new AppSettings();
        await loaded.loadFromStore(persistentStore);
        // Invalid value is ignored; default is kept
        expect(loaded.videoPlaybackRate).toBe(1);
    });

    test("contrastClass and blurClass", ({ fixture: { appSettings } }) => {
        appSettings.contrastStrength = 2;
        appSettings.blurStrength = 3;
        expect(appSettings.contrastClass).toBe(AppSettings.CONTRAST_OPTIONS[2]);
        expect(appSettings.blurClass).toBe(AppSettings.BLUR_OPTIONS[3]);
    });
});
