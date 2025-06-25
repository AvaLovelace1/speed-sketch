import { load } from "@tauri-apps/plugin-store";

export interface PersistentStore {
    get(key: string): Promise<unknown>;
}

export async function loadStore() {
    return load("store.json", { autoSave: false });
}
