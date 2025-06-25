// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import type { LayoutLoad } from "./$types";
import { loadStore } from "$lib/persistent-store.svelte";
import { loadSessionSettings } from "$lib/session-settings.svelte";
import { loadAppSettings } from "$lib/app-settings.svelte";

export const load: LayoutLoad = async () => {
    await loadStore()
        .then(async (store) => {
            await loadSessionSettings(store);
            await loadAppSettings(store);
        })
        .catch((e) => {
            console.error("Failed to load persistent store:", e);
        });
};
