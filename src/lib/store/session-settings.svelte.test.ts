import { describe, test, expect } from "vitest";
import {
    sessionSettings,
    loadSessionSettings,
    saveSessionSettings,
} from "./session-settings.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

describe("session-settings.svelte.ts", () => {
    test("saveSessionSettings and loadSessionSettings", async () => {
        const persistentStore = createMapStore();

        // Save settings
        const desiredImgFolder = "folder1";
        sessionSettings.imgFolder = desiredImgFolder;
        await saveSessionSettings(persistentStore);

        sessionSettings.imgFolder = "folder2"; // Change to a different setting

        // Load settings
        await loadSessionSettings(persistentStore);
        expect(sessionSettings.imgFolder).toBe(desiredImgFolder);
    });

    test("loading before settings are saved does nothing", async () => {
        const persistentStore = createMapStore();

        const desiredImgFolder = "folder3";
        sessionSettings.imgFolder = desiredImgFolder;
        await loadSessionSettings(persistentStore);
        expect(sessionSettings.imgFolder).toBe(desiredImgFolder);
    });
});
