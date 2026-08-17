import * as z from "zod";
import { describe, expect, test as base } from "vitest";
import { ValidatedStore } from "./validated-store.svelte";
import { createMapStore } from "$lib/store/persistent-store.svelte";

const test = base
    .extend("validatedStore", ({ task: _task }) => {
        const schema = z.object({
            aString: z.string(),
            aNumberEqualling42: z.number().lte(42).gte(42),
            aBoolean: z.boolean(),
            anObject: z.object({ key1: z.string(), key2: z.number() }),
        });
        return new ValidatedStore(createMapStore(), schema);
    })
    .extend("record", ({ task: _task }) => ({
        aString: "test string",
        aNumberEqualling42: 42,
        aBoolean: true,
        anObject: { key1: "value1", key2: 2 },
    }));

describe("validated-store.svelte.ts", () => {
    test("persists data to store, ignoring unknown keys", async ({ validatedStore, record }) => {
        await validatedStore.save({ ...record, unknownKey: "should be ignored" });

        const loadedRecord = {};
        await validatedStore.loadInto(loadedRecord);
        expect(loadedRecord).toEqual(record);
    });

    test("save no-ops if values are invalid or missing", async ({ validatedStore, record }) => {
        for (const invalidRecord of [
            { ...record, aNumberEqualling42: 24 },
            { aString: "test string" },
        ]) {
            await validatedStore.save(record);
            await validatedStore.save(invalidRecord);
            const loadedRecord = {};
            await validatedStore.loadInto(loadedRecord);
            expect(loadedRecord).toEqual(record);
        }
    });
});
