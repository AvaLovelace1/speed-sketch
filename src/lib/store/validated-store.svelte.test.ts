import { describe, expect, test as base } from "vitest";
import { ValidatedStore } from "./validated-store.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

interface ValidatedStoreFixture {
    validatedStore: ValidatedStore;
}

const test = base.extend<ValidatedStoreFixture>({
    validatedStore: async ({ task: _task }, use) => {
        const keys = [
            {
                key: "aString",
                isValid: (value: unknown): value is string => typeof value === "string",
            },
            {
                key: "aNumberEqualling42",
                isValid: (value: unknown): value is number =>
                    typeof value === "number" && value === 42,
            },
            {
                key: "aBoolean",
                isValid: (value: unknown): value is boolean => typeof value === "boolean",
            },
            {
                key: "anObject",
                isValid: (value: unknown): value is Record<string, unknown> =>
                    typeof value === "object" && value !== null && !Array.isArray(value),
            },
        ];
        const validatedStore = new ValidatedStore(createMapStore(), keys);
        await use(validatedStore);
    },
});

describe("validated-store.svelte.ts", () => {
    test("save and load", async ({ validatedStore }) => {
        // Test with extra and missing keys
        const record = {
            aString: "test string",
            aNumberEqualling42: 42,
            // aBoolean is missing
            anObject: { key1: "value1", key2: 2 },
            unknownKey: "should be ignored", // This key is not defined in the validation keys
        };
        await validatedStore.save(record);

        const loadedRecord = {};
        await validatedStore.loadInto(loadedRecord);
        expect(loadedRecord).toEqual({
            aString: "test string",
            aNumberEqualling42: 42,
            anObject: { key1: "value1", key2: 2 },
        });
    });

    test("load with invalid values", async ({ validatedStore }) => {
        const record = {
            aString: "test string",
            aNumberEqualling42: 24, // Invalid value, should be 42
            aBoolean: true,
            anObject: { key1: "value1", key2: 2 },
        };
        await validatedStore.save(record);

        const loadedRecord = {};
        await validatedStore.loadInto(loadedRecord);
        expect(loadedRecord).toEqual({
            aString: "test string",
            aBoolean: true,
            anObject: { key1: "value1", key2: 2 },
        });
    });
});
