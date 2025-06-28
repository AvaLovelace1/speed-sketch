import { describe, expect, test } from "vitest";
import { ValidatedStore } from "$lib/store/validated-store.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

interface ValidatedStoreFixture {
    validatedStore: ValidatedStore;
}

const testValidatedStore = test.extend<ValidatedStoreFixture>({
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
        ];
        const validatedStore = new ValidatedStore(createMapStore(), keys);
        await use(validatedStore);
    },
});

describe("validated-store.svelte.ts", () => {
    testValidatedStore("save and load", async ({ validatedStore }) => {
        const record = {
            aString: "test string",
            aNumberEqualling42: 42,
            aBoolean: true,
            unknownKey: "should be ignored", // This key is not defined in the validation keys
        };
        await validatedStore.save(record);

        const loadedRecord = {};
        await validatedStore.loadInto(loadedRecord);
        expect(loadedRecord).toEqual({
            aString: "test string",
            aNumberEqualling42: 42,
            aBoolean: true,
        });
    });

    testValidatedStore("load with invalid values", async ({ validatedStore }) => {
        const record = {
            aString: "test string",
            aNumberEqualling42: 24, // Invalid value, should be 42
            aBoolean: true,
        };
        await validatedStore.save(record);

        const loadedRecord = {};
        await validatedStore.loadInto(loadedRecord);
        expect(loadedRecord).toEqual({
            aString: "test string",
            aBoolean: true,
        });
    });
});
