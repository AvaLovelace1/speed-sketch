import * as z from "zod";
import { describe, test as base, expect, vi } from "vitest";
import { SessionSettings, type SessionSettingsEntries } from "./session-settings.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

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

const test = base
    .extend("persistentStore", ({ task: _task }) => createMapStore())
    .extend("sessionSettings", ({ task: _task }) => new SessionSettings())
    .extend("customEntries", ({ task: _task }) => ({
        imgFolders: [FOLDER_NAME],
        includeSubfolders: false,
        shuffleImgs: false,
        sessionMode: "Class",
        imgShowTimeOption: "5m",
        imgShowTimeCustom: 42,
        schedulePresets: [
            SessionSettings.DEFAULT_PRESET,
            {
                name: "My Custom Schedule",
                schedule: [
                    { duration: 60, repeat: 5, id: "1m x 5" },
                    { duration: 120, repeat: 1, id: "2m break", isBreak: true },
                ],
            },
        ],
        selectedScheduleIdx: 1,
    }));

describe("session-settings.svelte.ts", () => {
    describe("saving and loading", () => {
        test("changes are persisted to store for all entries", async ({
            sessionSettings,
            persistentStore,
            customEntries,
        }) => {
            z.parse(SessionSettings.SCHEMA.strict(), customEntries);

            // Modify settings and save to store
            for (const [key, value] of Object.entries(customEntries)) {
                expect(sessionSettings[key]).not.toEqual(value);
                sessionSettings[key] = value;
            }
            await sessionSettings.saveToStore(persistentStore);

            // Load from store
            const loaded = new SessionSettings();
            await loaded.loadFromStore(persistentStore);
            expect(loaded.toPlainObject()).toEqual(expect.objectContaining(customEntries));
        });

        test("falls back to defaults when loading from empty store", async ({
            sessionSettings,
            persistentStore,
            customEntries,
        }) => {
            for (const [key, value] of Object.entries(customEntries)) {
                sessionSettings[key] = value;
            }
            await sessionSettings.loadFromStore(persistentStore);
            expect(sessionSettings.toPlainObject()).toEqual(
                expect.objectContaining(SessionSettings.DEFAULTS),
            );
        });

        test.for([
            { key: "imgFolders", invalidEntries: [[3]] },
            { key: "includeSubfolders", invalidEntries: [1] },
            { key: "shuffleImgs", invalidEntries: [1] },
            { key: "sessionMode", invalidEntries: ["invalid mode"] },
            { key: "imgShowTimeOption", invalidEntries: ["invalid show time"] },
            {
                key: "imgShowTimeCustom",
                invalidEntries: [0, SessionSettings.MAX_IMG_SHOW_TIME + 1],
            },
            { key: "schedulePresets", invalidEntries: ["not an array"] },
            { key: "selectedScheduleIdx", invalidEntries: [-1] },
        ])(
            "rejects invalid values and falls back to defaults on load for key $key",
            async ({ key, invalidEntries }, { customEntries }) => {
                for (const entry of invalidEntries) {
                    const persistentStore = createMapStore();

                    // Populate persistent store with valid values + one invalid value
                    const sessionSettings = new SessionSettings();
                    for (const [key, value] of Object.entries(customEntries)) {
                        sessionSettings[key] = value;
                    }
                    await sessionSettings.saveToStore(persistentStore);
                    await persistentStore.set(key, entry);

                    // Load settings from store
                    const loaded = new SessionSettings();
                    await loaded.loadFromStore(persistentStore);
                    const expectedEntries = {
                        ...customEntries,
                        [key]: SessionSettings.DEFAULTS[key as keyof SessionSettingsEntries],
                    };
                    expectedEntries.selectedScheduleIdx = Math.min(
                        expectedEntries.selectedScheduleIdx,
                        expectedEntries.schedulePresets.length - 1,
                    );
                    expect(loaded.toPlainObject()).toEqual(
                        expect.objectContaining(expectedEntries),
                    );
                }
            },
        );

        test("invalid schedule name falls back without affecting other schedules", async ({
            sessionSettings,
            persistentStore,
            customEntries,
        }) => {
            const validSchedule = customEntries.schedulePresets[1].schedule;
            const presets = [
                ...customEntries.schedulePresets,
                { name: 9999, schedule: validSchedule },
            ];
            await persistentStore.set("schedulePresets", presets);
            await sessionSettings.loadFromStore(persistentStore);
            expect($state.snapshot(sessionSettings.schedulePresets)).toEqual([
                ...customEntries.schedulePresets,
                { name: "Preset", schedule: validSchedule },
            ]);
        });

        test.for([
            [{ duration: 300, repeat: 2, id: 9999 }],
            [
                { duration: 300, repeat: 2, id: "duplicate" },
                { duration: 300, repeat: 2, id: "duplicate" },
            ],
            ["not a schedule"],
        ])(
            "invalid schedule falls back without affecting other schedules",
            async (badSchedule, { sessionSettings, persistentStore, customEntries }) => {
                await persistentStore.set("schedulePresets", [
                    ...customEntries.schedulePresets,
                    { name: "Funky Preset", schedule: badSchedule },
                ]);
                await sessionSettings.loadFromStore(persistentStore);
                expect($state.snapshot(sessionSettings.schedulePresets)).toEqual([
                    ...customEntries.schedulePresets,
                    { name: "Funky Preset", schedule: SessionSettings.DEFAULT_PRESET.schedule },
                ]);
            },
        );

        test.for([
            {
                key: "duration",
                invalidEntries: [-1, SessionSettings.MAX_IMG_SHOW_TIME + 1],
                fallback: 60,
            },
            { key: "repeat", invalidEntries: [0], fallback: 1 },
            { key: "isBreak", invalidEntries: [1], fallback: false },
        ])(
            "invalid schedule entry $key falls back without affecting other entries",
            async ({ key, invalidEntries, fallback }, { customEntries }) => {
                const goodEntry1 = { duration: 60, repeat: 5, id: "1m x 5" };
                const goodEntry2 = { duration: 120, repeat: 1, id: "2m break", isBreak: true };
                for (const entry of invalidEntries) {
                    const persistentStore = createMapStore();
                    const badEntry = {
                        duration: 300,
                        repeat: 2,
                        id: "5m x 2",
                        isBreak: false,
                        [key]: entry,
                    };
                    await persistentStore.set("schedulePresets", [
                        ...customEntries.schedulePresets,
                        {
                            name: "Funky Preset",
                            schedule: [goodEntry1, goodEntry2, badEntry],
                        },
                    ]);

                    const sessionSettings = new SessionSettings();
                    await sessionSettings.loadFromStore(persistentStore);

                    expect($state.snapshot(sessionSettings.schedulePresets)).toEqual([
                        ...customEntries.schedulePresets,
                        {
                            name: "Funky Preset",
                            schedule: [goodEntry1, goodEntry2, { ...badEntry, [key]: fallback }],
                        },
                    ]);
                }
            },
        );

        test("loadFromStore clamps selectedScheduleIdx if out of bounds", async ({
            persistentStore,
            customEntries,
        }) => {
            await persistentStore.set("schedulePresets", customEntries.schedulePresets);
            await persistentStore.set("selectedScheduleIdx", customEntries.schedulePresets.length);
            await persistentStore.save();

            const loaded = new SessionSettings();
            await loaded.loadFromStore(persistentStore);
            expect(loaded.selectedScheduleIdx).toBe(customEntries.schedulePresets.length - 1);
        });
    });

    describe("imgShowTime", () => {
        test.for([
            { option: "30s", expected: 30 },
            { option: "2m", expected: 120 },
            { option: "Custom", expected: 1337 },
        ])(
            "returns the selected image show time ($option)",
            ({ option, expected }, { sessionSettings }) => {
                sessionSettings.imgShowTimeOption = option;
                if (option === "Custom") sessionSettings.imgShowTimeCustom = expected;
                expect(sessionSettings.imgShowTime).toBe(expected);
            },
        );
    });

    describe("sessionSchedule", () => {
        test("returns an endless schedule if Endless selected", ({ sessionSettings }) => {
            sessionSettings.sessionMode = "Endless";
            sessionSettings.imgShowTimeOption = "2m";

            expect(sessionSettings.sessionSchedule).toEqual([
                { duration: 120, repeat: Infinity, id: "endless" },
            ]);
        });

        test("returns the custom schedule if Custom selected", ({
            sessionSettings,
            customEntries,
        }) => {
            sessionSettings.sessionMode = "Custom";
            sessionSettings.schedulePresets = customEntries.schedulePresets;
            sessionSettings.selectedScheduleIdx = 1;

            expect(sessionSettings.sessionSchedule).toBe(
                sessionSettings.schedulePresets[1].schedule,
            );
        });
    });

    describe("sessionScheduleCustom", () => {
        test("returns the selected custom schedule", ({ sessionSettings, customEntries }) => {
            sessionSettings.sessionMode = "Endless"; // even when "Endless" is selected
            sessionSettings.schedulePresets = customEntries.schedulePresets;
            sessionSettings.selectedScheduleIdx = 1;

            expect(sessionSettings.sessionScheduleCustom).toBe(
                sessionSettings.schedulePresets[1].schedule,
            );
        });

        test("returns undefined if selected idx is -1", ({ sessionSettings, customEntries }) => {
            sessionSettings.sessionMode = "Endless";
            sessionSettings.schedulePresets = customEntries.schedulePresets;
            sessionSettings.selectedScheduleIdx = -1;
            expect(sessionSettings.sessionScheduleCustom).toBeUndefined();
        });

        test("editing sessionScheduleCustom mutates the saved schedule", ({ sessionSettings }) => {
            const newEntry = { duration: 60, repeat: 5, id: "x" };
            sessionSettings.sessionScheduleCustom?.unshift(newEntry);
            expect(sessionSettings.schedulePresets).toHaveLength(1);
            expect(sessionSettings.schedulePresets[0].schedule[0]).toEqual(newEntry);
        });
    });

    describe("selectSchedulePreset", () => {
        test.for([0, 1])("selects preset %d", (idx, { sessionSettings }) => {
            sessionSettings.addSchedulePreset("Warmup");
            sessionSettings.selectSchedulePreset(idx);
            expect(sessionSettings.sessionScheduleCustom).toBe(
                sessionSettings.schedulePresets[idx].schedule,
            );
        });

        test.for([-2, 2])("throws for out-of-range index %d", (idx, { sessionSettings }) => {
            sessionSettings.addSchedulePreset("Warmup");
            expect(() => sessionSettings.selectSchedulePreset(idx)).toThrow("out of range");
        });
    });

    test("addSchedulePreset appends and selects new schedule", ({ sessionSettings }) => {
        sessionSettings.addSchedulePreset("Warmup");
        expect(sessionSettings.schedulePresets).toEqual([
            SessionSettings.DEFAULT_PRESET,
            { name: "Warmup", schedule: [] },
        ]);
        expect(sessionSettings.selectedScheduleIdx).toBe(1);
    });

    describe("renameSchedulePreset", () => {
        test.for([0, 1])("renames selected schedule %d", (idx, { sessionSettings }) => {
            sessionSettings.renameSchedulePreset("New Name");
            expect(sessionSettings.schedulePresets[0].name).toBe("New Name");
        });

        test("is no-op if no schedule selected", ({ sessionSettings }) => {
            sessionSettings.selectSchedulePreset(-1);
            sessionSettings.renameSchedulePreset("New Name");
            expect(sessionSettings.schedulePresets).toEqual([SessionSettings.DEFAULT_PRESET]);
            expect(sessionSettings.selectedScheduleIdx).toBe(-1);
        });
    });

    describe("removeSchedulePreset", () => {
        test.for([
            { idx: 0, expectedSchedule: [{ name: "Warmup", schedule: [] }] },
            { idx: 1, expectedSchedule: [SessionSettings.DEFAULT_PRESET] },
        ])("removes selected schedule %d", ({ idx, expectedSchedule }, { sessionSettings }) => {
            sessionSettings.addSchedulePreset("Warmup");
            sessionSettings.selectSchedulePreset(idx);
            sessionSettings.removeSchedulePreset();
            expect(sessionSettings.schedulePresets).toEqual(expectedSchedule);
            expect(sessionSettings.selectedScheduleIdx).toBe(0);
        });

        test("removes only schedule", ({ sessionSettings }) => {
            sessionSettings.removeSchedulePreset();
            expect(sessionSettings.schedulePresets).toEqual([]);
            expect(sessionSettings.selectedScheduleIdx).toBe(-1);
        });

        test("is no-op if no schedule selected", ({ sessionSettings }) => {
            sessionSettings.selectSchedulePreset(-1);
            sessionSettings.removeSchedulePreset();
            expect(sessionSettings.schedulePresets).toEqual([SessionSettings.DEFAULT_PRESET]);
            expect(sessionSettings.selectedScheduleIdx).toBe(-1);
        });
    });

    test("saved presets persist to store", async ({ sessionSettings, persistentStore }) => {
        const entry = { duration: 30, repeat: 5, id: "a", isBreak: false };
        sessionSettings.addSchedulePreset("Warmup");
        sessionSettings.schedulePresets[1].schedule.push(entry);
        await sessionSettings.saveToStore(persistentStore);

        const loaded = new SessionSettings();
        await loaded.loadFromStore(persistentStore);
        expect(loaded.schedulePresets).toEqual([
            SessionSettings.DEFAULT_PRESET,
            { name: "Warmup", schedule: [entry] },
        ]);
    });

    describe("getting images", () => {
        test("getImgs throws on empty image list", async ({ sessionSettings }) => {
            sessionSettings.imgs = [];
            await expect(sessionSettings.getImgs()).rejects.toThrow("No references found");
        });

        test("getImgs returns images shuffled if `shuffleImgs` is true", async ({
            sessionSettings,
        }) => {
            const imgs = [...SORTED_IMGS];
            sessionSettings.imgs = imgs;

            // Not shuffled (should return sorted order)
            sessionSettings.shuffleImgs = false;
            await expect(sessionSettings.getImgs()).resolves.toEqual(SORTED_IMGS);

            // Shuffled images
            sessionSettings.shuffleImgs = true;
            await expect(sessionSettings.getImgs()).resolves.toEqual(expect.arrayContaining(imgs));
            await expect(sessionSettings.getImgs()).resolves.toHaveLength(SORTED_IMGS.length);
            await expect.poll(async () => await sessionSettings.getImgs()).not.toEqual(SORTED_IMGS);

            // Unshuffle again
            sessionSettings.shuffleImgs = false;
            await expect(sessionSettings.getImgs()).resolves.toEqual(SORTED_IMGS);
        });

        test("getImgsFromFolder returns images from specified folder", async ({
            sessionSettings,
        }) => {
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

        test("getImgsFromFolders handles libraries with many files", async ({
            sessionSettings,
        }) => {
            const { invoke } = await import("@tauri-apps/api/core");
            const numFiles = 400_000;
            vi.mocked(invoke).mockResolvedValueOnce(
                Array.from({ length: numFiles }, (_, i) => `/folder/img${i}.jpg`),
            );
            sessionSettings.imgFolders = ["/folder"];
            const imgs = await sessionSettings.getImgsFromFolders();
            expect(imgs).toHaveLength(numFiles);
        });
    });
});
