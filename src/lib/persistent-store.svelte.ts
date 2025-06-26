import { load } from "@tauri-apps/plugin-store";
import { isTauri } from "@tauri-apps/api/core";

export interface PersistentStore {
    // Get a value by key. Returns undefined if the key does not exist.
    get(key: string): Promise<unknown>;
    // Set a value by key.
    set(key: string, value: unknown): Promise<void>;
    // Save the store to disk.
    save(): Promise<void>;
}

export let persistentStore: PersistentStore;

export async function getStore() {
    if (!persistentStore) {
        if (isTauri()) {
            // Use Tauri's filesystem-based store
            persistentStore = await load("store.json", { autoSave: false });
        } else {
            // Use browser's localStorage
            persistentStore = {
                get: async (key: string) => {
                    const value = localStorage.getItem(key);
                    return value ? JSON.parse(value) : undefined;
                },
                set: async (key: string, value: unknown) => {
                    localStorage.setItem(key, JSON.stringify(value));
                },
                save: async () => {
                    // no-op for localstorage
                },
            };
        }
    }
    return persistentStore;
}
