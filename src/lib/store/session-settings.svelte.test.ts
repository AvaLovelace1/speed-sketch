import { describe, test, expect } from "vitest";
import { SessionSettings } from "./session-settings.svelte";
import { createMapStore, type PersistentStore } from "$lib/store/persistent-store.svelte";

interface SessionSettingsFixture {
    fixture: {
        sessionSettings: SessionSettings;
        persistentStore: PersistentStore;
    };
}

const testSessionSettings = test.extend<SessionSettingsFixture>({
    fixture: async ({ task: _task }, use) => {
        const persistentStore = createMapStore();
        const sessionSettings = new SessionSettings();
        await use({ sessionSettings, persistentStore });
    },
});

describe("session-settings.svelte.ts", () => {
    testSessionSettings(
        "saveSessionSettings and loadSessionSettings",
        async ({ fixture: { sessionSettings, persistentStore } }) => {
            // Save settings
            const desiredImgFolder = "folder1";
            sessionSettings.imgFolder = desiredImgFolder;
            await sessionSettings.saveToStore(persistentStore);

            sessionSettings.imgFolder = "folder2"; // Change to a different setting

            // Load settings
            await sessionSettings.loadFromStore(persistentStore);
            expect(sessionSettings.imgFolder).toBe(desiredImgFolder);
        },
    );

    testSessionSettings(
        "loading before settings are saved does nothing",
        async ({ fixture: { sessionSettings, persistentStore } }) => {
            const desiredImgFolder = "folder3";
            sessionSettings.imgFolder = desiredImgFolder;
            await sessionSettings.loadFromStore(persistentStore);
            expect(sessionSettings.imgFolder).toBe(desiredImgFolder);
        },
    );

    testSessionSettings.for([
        {
            option: "30s",
            expected: 30,
        },
        {
            option: "2m",
            expected: 120,
        },
        {
            option: "Custom",
            expected: 1337,
        },
    ])("getImgShowTime for %s", ({ option, expected }, { fixture: { sessionSettings } }) => {
        sessionSettings.imgShowTimeOption = option;
        if (option === "Custom") sessionSettings.imgShowTimeCustom = expected;
        expect(sessionSettings.imgShowTime).toBe(expected);
    });

    testSessionSettings("getImgsFromFolder", async ({ fixture: { sessionSettings } }) => {
        sessionSettings.imgFolder = "";
        await expect(sessionSettings.getImgsFromFolder()).rejects.toThrow("Please choose a folder");
    });

    testSessionSettings("getImgs", async ({ fixture: { sessionSettings } }) => {
        sessionSettings.imgFolder = "";

        // Empty image list
        sessionSettings.imgs = [];
        await expect(sessionSettings.getImgs()).rejects.toThrow("No images found");

        // Valid image list
        const sortedImgs = [{ url: "image1.jpg" }, { url: "image2.jpg" }, { url: "image3.jpg" }];
        const imgs = [{ url: "image3.jpg" }, { url: "image2.jpg" }, { url: "image1.jpg" }];
        sessionSettings.imgs = imgs;
        sessionSettings.shuffleImgs = false;
        await expect(sessionSettings.getImgs()).resolves.toEqual(sortedImgs);
        sessionSettings.shuffleImgs = true;
        await expect(sessionSettings.getImgs()).resolves.toEqual(expect.arrayContaining(imgs));
    });
});
