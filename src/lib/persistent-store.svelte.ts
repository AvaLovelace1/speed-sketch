import { load } from "@tauri-apps/plugin-store";

export interface PersistentStore {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<void>;
    save(): Promise<void>;
}

export let persistentStore: PersistentStore;

export async function getStore() {
    if (!persistentStore) persistentStore = await load("store.json", { autoSave: false });
    return persistentStore;
}
