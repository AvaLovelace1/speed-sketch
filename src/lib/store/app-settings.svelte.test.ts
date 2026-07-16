import { describe, test as base, expect } from "vitest";
import { AppSettings } from "./app-settings.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

const test = base
    .extend("persistentStore", ({ task: _task }) => createMapStore())
    .extend("appSettings", ({ task: _task }) => new AppSettings());

describe("app-settings.svelte.ts", () => {
    test("saveAppSettings and loadAppSettings", async ({ appSettings, persistentStore }) => {
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
        appSettings,
        persistentStore,
    }) => {
        const desiredTheme = "light";
        appSettings.theme = desiredTheme;
        await appSettings.loadFromStore(persistentStore);
        expect(appSettings.theme).toBe(desiredTheme);
    });

    test("videoPlaybackRate defaults to 1 and persists", async ({
        appSettings,
        persistentStore,
    }) => {
        expect(appSettings.videoPlaybackRate).toBe(1);
        appSettings.videoPlaybackRate = 1.5;
        await appSettings.saveToStore(persistentStore);

        const loaded = new AppSettings();
        await loaded.loadFromStore(persistentStore);
        expect(loaded.videoPlaybackRate).toBe(1.5);
    });

    test("videoPlaybackRate rejects out-of-range values on load", async ({ persistentStore }) => {
        await persistentStore.set("videoPlaybackRate", 99);
        await persistentStore.save();
        const loaded = new AppSettings();
        await loaded.loadFromStore(persistentStore);
        // Invalid value is ignored; default is kept
        expect(loaded.videoPlaybackRate).toBe(1);
    });

    test("contrastClass and blurClass", ({ appSettings }) => {
        appSettings.contrastStrength = 2;
        appSettings.blurStrength = 3;
        expect(appSettings.contrastClass).toBe(AppSettings.CONTRAST_OPTIONS[2]);
        expect(appSettings.blurClass).toBe(AppSettings.BLUR_OPTIONS[3]);
    });
});
