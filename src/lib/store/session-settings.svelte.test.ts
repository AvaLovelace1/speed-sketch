import { describe, test as base, expect } from "vitest";
import { SessionSettings } from "./session-settings.svelte";
import { createMapStore, type PersistentStore } from "$lib/store/persistent-store.svelte";

const FOLDER_NAME = "your/test-folder";
const SORTED_IMGS = [
    { name: "image1.jpg", url: "https://localhost/image1.jpg", path: `${FOLDER_NAME}/image1.jpg` },
    { name: "image2.jpg", url: "https://localhost/image2.jpg", path: `${FOLDER_NAME}/image2.jpg` },
    { name: "image3.jpg", url: "https://localhost/image3.jpg", path: `${FOLDER_NAME}/image3.jpg` },
];

interface SessionSettingsFixture {
    fixture: {
        sessionSettings: SessionSettings;
        persistentStore: PersistentStore;
    };
}

const test = base.extend<SessionSettingsFixture>({
    fixture: async ({ task: _task }, use) => {
        const persistentStore = createMapStore();
        const sessionSettings = new SessionSettings();
        await use({ sessionSettings, persistentStore });
    },
});

describe("session-settings.svelte.ts", () => {
    test("saveSessionSettings and loadSessionSettings", async ({
        fixture: { sessionSettings, persistentStore },
    }) => {
        // Save settings
        const desiredImgFolder = "folder1";
        sessionSettings.imgFolder = desiredImgFolder;
        await sessionSettings.saveToStore(persistentStore);

        sessionSettings.imgFolder = "folder2"; // Change to a different setting

        // Load settings
        await sessionSettings.loadFromStore(persistentStore);
        expect(sessionSettings.imgFolder).toBe(desiredImgFolder);
    });

    test("loading before settings are saved does nothing", async ({
        fixture: { sessionSettings, persistentStore },
    }) => {
        const desiredImgFolder = "folder3";
        sessionSettings.imgFolder = desiredImgFolder;
        await sessionSettings.loadFromStore(persistentStore);
        expect(sessionSettings.imgFolder).toBe(desiredImgFolder);
    });

    test.for([
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

    test("getImgs", async ({ fixture: { sessionSettings } }) => {
        sessionSettings.imgFolder = "";

        // Empty image list
        sessionSettings.imgs = [];
        await expect(sessionSettings.getImgs()).rejects.toThrow("No images found");

        // Valid image list
        const imgs = [SORTED_IMGS[2], SORTED_IMGS[0], SORTED_IMGS[1]];
        sessionSettings.imgs = imgs;

        // Not shuffled (should return sorted order)
        sessionSettings.shuffleImgs = false;
        await expect(sessionSettings.getImgs()).resolves.toEqual(SORTED_IMGS);

        // Shuffled images
        sessionSettings.shuffleImgs = true;
        await expect(sessionSettings.getImgs()).resolves.toEqual(expect.arrayContaining(imgs));
        await expect(sessionSettings.getImgs()).resolves.toHaveLength(SORTED_IMGS.length);
        await expect.poll(sessionSettings.getImgs).not.toEqual(SORTED_IMGS);

        // Unshuffle again
        sessionSettings.shuffleImgs = false;
        await expect(sessionSettings.getImgs()).resolves.toEqual(SORTED_IMGS);
    });
});
