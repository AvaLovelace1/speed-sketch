import * as z from "zod";
import type { PersistentStore } from "$lib/store/persistent-store.svelte";

// Manages the schema-validated persistent storage of a group of key-value pairs
export class ValidatedStore {
    constructor(
        public persistentStore: PersistentStore,
        public schema: z.ZodObject,
    ) {}

    // Validates and saves `record` to the persistent store
    async save(record: Record<string, unknown>) {
        const parsed = z.safeParse(this.schema, record);
        if (!parsed.success) {
            console.error("Record parsing failed:", parsed.error);
            return;
        }
        for (const [key, value] of Object.entries(parsed.data as object)) {
            try {
                await this.persistentStore.set(key, value);
            } catch (e) {
                console.error(`Failed to save setting ${key} with value ${record[key]}:`, e);
            }
        }
        try {
            await this.persistentStore.save();
        } catch (e) {
            console.error("Failed to save persistent store to disk:", e);
        }
    }

    // Validates and loads `record` from the persistent store
    async loadInto(record: Record<string, unknown>) {
        const storeData: Record<string, unknown> = {};
        for (const key of Object.keys(this.schema.shape)) {
            try {
                const value = await this.persistentStore.get(key);
                if (value === undefined) console.warn(`Key ${key} not found in store.`);
                else storeData[key] = value;
            } catch (e) {
                console.error(`Failed to load ${key} from store:`, e);
            }
        }
        const parsed = z.safeParse(this.schema, storeData);
        if (!parsed.success) {
            console.error("Persistent store parsing failed:", parsed.error);
            return;
        }
        // we set each key individually to avoid problems with Svelte reactive state
        for (const [key, value] of Object.entries(parsed.data)) {
            record[key] = value;
        }
    }
}
