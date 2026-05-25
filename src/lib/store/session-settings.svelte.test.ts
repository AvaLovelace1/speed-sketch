import { describe, test as base, expect, vi } from "vitest";
import { SessionSettings } from "./session-settings.svelte";
import { createMapStore, type PersistentStore } from "$lib/store/persistent-store.svelte";

vi.mock("@tauri-apps/api/core", async () => {
    return {
        invoke: vi.fn(),
        convertFileSrc: (p: string) => `tauri://localhost/${p}`,
        isTauri: () => false,
    };
});

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
        const desiredImgFolders = ["folder1"];
        sessionSettings.imgFolders = desiredImgFolders;
        await sessionSettings.saveToStore(persistentStore);

        sessionSettings.imgFolders = ["folder2"]; // Change to a different setting

        // Load settings
        await sessionSettings.loadFromStore(persistentStore);
        expect(sessionSettings.imgFolders).toEqual(desiredImgFolders);
    });

    test("loading before settings are saved does nothing", async ({
        fixture: { sessionSettings, persistentStore },
    }) => {
        const desiredImgFolders = ["folder3"];
        sessionSettings.imgFolders = desiredImgFolders;
        await sessionSettings.loadFromStore(persistentStore);
        expect(sessionSettings.imgFolders).toEqual(desiredImgFolders);
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
        sessionSettings.imgFolders = [];

        // Empty image list
        sessionSettings.imgs = [];
        await expect(sessionSettings.getImgs()).rejects.toThrow("No images found");

        // Valid image list
        const imgs = [...SORTED_IMGS];
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

    test("getImgsFromFolder", async ({ fixture: { sessionSettings } }) => {
        const { invoke } = await import("@tauri-apps/api/core");
        vi.mocked(invoke).mockResolvedValueOnce([
            "/folder/a.jpg",
            "/folder/b.mp4",
            "/folder/c.png",
            "/folder/d.webm",
        ]);
        const imgs = await sessionSettings.getImgsFromFolder("/folder");
        const flags = imgs.map((i) => ({ name: i.name, isVideo: i.isVideo ?? false }));
        expect(flags).toEqual([
            { name: "a.jpg", isVideo: false },
            { name: "b.mp4", isVideo: true },
            { name: "c.png", isVideo: false },
            { name: "d.webm", isVideo: true },
        ]);
    });

    test("sessionScheduleCustom returns the selected schedule", ({
        fixture: { sessionSettings },
    }) => {
        expect(sessionSettings.sessionScheduleCustom).toBe(
            sessionSettings.schedulePresets[0].schedule,
        );
    });

    test("addSchedulePreset appends and selects new schedule", ({
        fixture: { sessionSettings },
    }) => {
        sessionSettings.addSchedulePreset("Warmup");
        expect(sessionSettings.schedulePresets).toHaveLength(2);
        expect(sessionSettings.schedulePresets[1]).toEqual({ name: "Warmup", schedule: [] });
        expect(sessionSettings.selectedScheduleIdx).toBe(1);
    });

    test("selectSchedulePreset changes sessionScheduleCustom", ({
        fixture: { sessionSettings },
    }) => {
        sessionSettings.addSchedulePreset("Warmup");
        sessionSettings.selectSchedulePreset(0);
        expect(sessionSettings.sessionScheduleCustom).toBe(
            sessionSettings.schedulePresets[0].schedule,
        );
        sessionSettings.selectSchedulePreset(1);
        expect(sessionSettings.sessionScheduleCustom).toBe(
            sessionSettings.schedulePresets[1].schedule,
        );
    });

    test("selectSchedulePreset throws for out-of-range index", ({
        fixture: { sessionSettings },
    }) => {
        expect(() => sessionSettings.selectSchedulePreset(-1)).toThrow("out of range");
        expect(() => sessionSettings.selectSchedulePreset(1)).toThrow("out of range");
    });

    test("editing sessionScheduleCustom mutates the saved schedule", ({
        fixture: { sessionSettings },
    }) => {
        const newEntry = { duration: 60, repeat: 5, id: "x" };
        sessionSettings.sessionScheduleCustom.unshift(newEntry);
        expect(sessionSettings.schedulePresets).toHaveLength(1);
        expect(sessionSettings.schedulePresets[0].schedule[0]).toEqual(newEntry);
    });

    test("renameSchedulePreset renames the selected schedule", ({
        fixture: { sessionSettings },
    }) => {
        sessionSettings.addSchedulePreset("Old Name");
        sessionSettings.renameSchedulePreset("New Name");
        expect(sessionSettings.schedulePresets[1].name).toBe("New Name");
        expect(sessionSettings.selectedScheduleIdx).toBe(1);
    });

    test("renameSchedulePreset is no-op for Default Preset", ({ fixture: { sessionSettings } }) => {
        sessionSettings.renameSchedulePreset("Something Else");
        expect(sessionSettings.schedulePresets[0].name).toBe(SessionSettings.DEFAULT_PRESET_NAME);
    });

    test("removeSchedulePreset removes selected schedule", ({ fixture: { sessionSettings } }) => {
        sessionSettings.addSchedulePreset("A");
        sessionSettings.addSchedulePreset("B");
        sessionSettings.addSchedulePreset("C");
        sessionSettings.selectSchedulePreset(1);
        sessionSettings.removeSchedulePreset();
        expect(sessionSettings.schedulePresets).toHaveLength(3);
        expect(sessionSettings.schedulePresets[0].name).toBe(SessionSettings.DEFAULT_PRESET_NAME);
        expect(sessionSettings.schedulePresets[1].name).toBe("B");
        expect(sessionSettings.schedulePresets[2].name).toBe("C");
        expect(sessionSettings.selectedScheduleIdx).toBe(1);
    });

    test("removeSchedulePreset is no-op for Default Preset", ({ fixture: { sessionSettings } }) => {
        sessionSettings.removeSchedulePreset();
        expect(sessionSettings.schedulePresets).toHaveLength(1);
        expect(sessionSettings.schedulePresets[0].name).toBe(SessionSettings.DEFAULT_PRESET_NAME);
    });

    test("removeSchedulePreset clamps index when removing last selected", ({
        fixture: { sessionSettings },
    }) => {
        sessionSettings.addSchedulePreset("A");
        sessionSettings.addSchedulePreset("B");
        expect(sessionSettings.selectedScheduleIdx).toBe(2);
        sessionSettings.removeSchedulePreset();
        expect(sessionSettings.selectedScheduleIdx).toBe(1);
    });

    test("saved schedules persist to store", async ({
        fixture: { sessionSettings, persistentStore },
    }) => {
        sessionSettings.addSchedulePreset("Warmup");
        sessionSettings.schedulePresets[1].schedule.push({
            duration: 30,
            repeat: 5,
            id: "a",
        });
        sessionSettings.selectSchedulePreset(0);
        await sessionSettings.saveToStore(persistentStore);

        const loaded = new SessionSettings();
        await loaded.loadFromStore(persistentStore);
        expect(loaded.schedulePresets).toHaveLength(2);
        expect(loaded.schedulePresets[0].name).toBe(SessionSettings.DEFAULT_PRESET_NAME);
        expect(loaded.schedulePresets[1].name).toBe("Warmup");
        expect(loaded.schedulePresets[1].schedule).toEqual([{ duration: 30, repeat: 5, id: "a" }]);
        expect(loaded.selectedScheduleIdx).toBe(0);
    });

    test("loadFromStore clamps selectedScheduleIdx if out of bounds", async ({
        fixture: { persistentStore },
    }) => {
        // Manually store an out-of-bounds index
        const schedulePresets = [
            { name: SessionSettings.DEFAULT_PRESET_NAME, schedule: [] },
            { name: "A", schedule: [] },
        ];
        await persistentStore.set("schedulePresets", schedulePresets);
        await persistentStore.set("selectedScheduleIdx", 5);
        await persistentStore.save();

        const loaded = new SessionSettings();
        await loaded.loadFromStore(persistentStore);
        expect(loaded.selectedScheduleIdx).toBe(1);
    });
});
