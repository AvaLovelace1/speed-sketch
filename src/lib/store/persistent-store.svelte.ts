import { load } from "@tauri-apps/plugin-store";
import { isTauri } from "@tauri-apps/api/core";
import { SvelteMap } from "svelte/reactivity";

export interface PersistentStore {
    // Get a value by key. Returns undefined if the key does not exist.
    get(key: string): Promise<unknown>;
    // Set a value by key.
    set(key: string, value: unknown): Promise<void>;
    // Save the store to disk.
    save(): Promise<void>;
}

export let persistentStore: PersistentStore;

// Get the single persistent store instance.
export async function getStore() {
    if (!persistentStore) {
        try {
            persistentStore = isTauri() ? await createTauriStore() : createLocalStorageStore();
        } catch (error) {
            console.error("Failed to create persistent store:", error);
            console.error("Falling back to in-memory store.");
            persistentStore = createMapStore();
        }
    }
    return persistentStore;
}

// Persistent store with Tauri's filesystem-based store
export async function createTauriStore() {
    if (!isTauri()) {
        throw new Error("This function can only be used in a Tauri environment.");
    }
    return await load("store.json", { autoSave: false });
}

// Persistent store with localStorage
export function createLocalStorageStore() {
    return {
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

// Persistent store with an in-memory map. Useful for testing
export function createMapStore() {
    const items = new SvelteMap<string, unknown>();
    const result: PersistentStore = {
        get: async (key: string) => {
            return items.get(key);
        },
        set: async (key: string, value: unknown) => {
            items.set(key, value);
        },
        save: async () => {
            console.warn("save() called on in-memory store, but it does nothing.");
        },
    };
    return result;
}
