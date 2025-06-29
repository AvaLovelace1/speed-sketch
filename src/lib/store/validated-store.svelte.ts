import { type PersistentStore } from "$lib/store/persistent-store.svelte";

// Manages the persistent storage of a group of key-value pairs.
// Validates the values when loading.
export class ValidatedStore {
    persistentStore: PersistentStore;
    keys: { key: string; isValid: (value: unknown) => boolean }[];

    constructor(
        persistentStore: PersistentStore,
        keys: { key: string; isValid: (value: unknown) => boolean }[],
    ) {
        this.persistentStore = persistentStore;
        this.keys = keys;
    }

    // Saves all specified keys (if present) and their values in a record to the persistent store.
    async save(record: Record<string, unknown>): Promise<void> {
        for (const { key } of this.keys) {
            if (!(key in record)) {
                console.warn(`Key ${key} not found in record, skipping save.`);
                continue;
            }
            try {
                await this.persistentStore.set(key, record[key]);
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

    // Loads values with the specified keys into the provided record object.
    // Ignores values that do not pass validation.
    async loadInto(record: Record<string, unknown>) {
        for (const { key, isValid } of this.keys) {
            try {
                const value = await this.persistentStore.get(key);
                if (value === undefined) console.warn(`Key ${key} not found in store.`);
                else if (!isValid(value))
                    console.warn(`Skipped loading ${key} because of invalid value:`, value);
                else record[key] = value;
            } catch (e) {
                console.error(`Failed to load ${key} from store:`, e);
            }
        }
    }
}
