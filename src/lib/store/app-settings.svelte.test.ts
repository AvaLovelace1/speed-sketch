import * as z from "zod";
import { describe, test as base, expect } from "vitest";
import { AppSettings, type AppSettingsEntries } from "./app-settings.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

const test = base
    .extend("appSettings", ({ task: _task }) => new AppSettings())
    .extend("persistentStore", ({ task: _task }) => createMapStore())
    .extend("customEntries", ({ task: _task }) => ({
        theme: "dark",
        volume: 0.42,
        contrastStrength: 2,
        blurStrength: 2,
        gridRows: 42,
        gridCols: 42,
        videoPlaybackRate: 0.42,
    }));

describe("app-settings.svelte.ts", () => {
    describe("saving and loading", () => {
        test("changes are persisted to store for all entries", async ({
            appSettings,
            persistentStore,
            customEntries,
        }) => {
            z.parse(AppSettings.SCHEMA.strict(), customEntries);

            // Modify settings and save to store
            for (const [key, value] of Object.entries(customEntries)) {
                expect(appSettings[key]).not.toEqual(value);
                appSettings[key] = value;
            }
            await appSettings.saveToStore(persistentStore);

            // Load from store
            const loaded = new AppSettings();
            await loaded.loadFromStore(persistentStore);
            expect(loaded.toPlainObject()).toEqual(expect.objectContaining(customEntries));
        });

        test("falls back to defaults when loading from empty store", async ({
            appSettings,
            persistentStore,
            customEntries,
        }) => {
            for (const [key, value] of Object.entries(customEntries)) {
                appSettings[key] = value;
            }
            await appSettings.loadFromStore(persistentStore);
            expect(appSettings.toPlainObject()).toEqual(
                expect.objectContaining(AppSettings.DEFAULTS),
            );
        });

        test.for([
            { key: "theme", invalidEntries: ["invalid theme"] },
            { key: "volume", invalidEntries: [-0.1, 1.1] },
            { key: "contrastStrength", invalidEntries: [-1, AppSettings.CONTRAST_OPTIONS.length] },
            { key: "blurStrength", invalidEntries: [-1, AppSettings.BLUR_OPTIONS.length] },
            { key: "gridRows", invalidEntries: [0, AppSettings.MAX_GRID_DIM + 1] },
            { key: "gridCols", invalidEntries: [0, AppSettings.MAX_GRID_DIM + 1] },
            {
                key: "videoPlaybackRate",
                invalidEntries: [
                    AppSettings.MIN_VIDEO_PLAYBACK_RATE - 0.1,
                    AppSettings.MAX_VIDEO_PLAYBACK_RATE + 0.1,
                ],
            },
        ])(
            "rejects invalid values and falls back to defaults on load for key $key",
            async ({ key, invalidEntries }, { customEntries }) => {
                for (const entry of invalidEntries) {
                    const persistentStore = createMapStore();

                    // Populate persistent store with valid values + one invalid value
                    const appSettings = new AppSettings();
                    for (const [key, value] of Object.entries(customEntries)) {
                        appSettings[key] = value;
                    }
                    await appSettings.saveToStore(persistentStore);
                    await persistentStore.set(key, entry);

                    // Load settings from store
                    const loaded = new AppSettings();
                    await loaded.loadFromStore(persistentStore);
                    expect(loaded.toPlainObject()).toEqual(
                        expect.objectContaining({
                            ...customEntries,
                            [key]: AppSettings.DEFAULTS[key as keyof AppSettingsEntries],
                        }),
                    );
                }
            },
        );
    });

    describe("getters", () => {
        test("contrastClass equals selected option", ({ appSettings }) => {
            appSettings.contrastStrength = 2;
            expect(appSettings.contrastClass).toEqual(AppSettings.CONTRAST_OPTIONS[2]);
        });

        test("blurClass equals selected option", ({ appSettings }) => {
            appSettings.blurStrength = 3;
            expect(appSettings.blurClass).toEqual(AppSettings.BLUR_OPTIONS[3]);
        });
    });
});
