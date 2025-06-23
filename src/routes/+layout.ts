// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import type { LayoutLoad } from "./$types";
import { load as loadStore } from "@tauri-apps/plugin-store";
import { imgShowTimes, maxImgShowTime, sessionStore } from "$lib/globals.svelte";

async function loadPersistentStore() {
    let persistentStore;
    try {
        persistentStore = await loadStore("store.json", { autoSave: false });
    } catch (e) {
        console.error("Failed to load persistent store:", e);
        return;
    }
    const imgFolder = await persistentStore.get("imgFolder").catch((e) => {
        console.error("Failed to get imgFolder from persistent store:", e);
        return null;
    });
    const imgShowTimeSelected = await persistentStore.get("imgShowTimeSelected").catch((e) => {
        console.error("Failed to get imgShowTimeSelected from persistent store:", e);
        return null;
    });
    const imgShowTimeCustom = await persistentStore.get("imgShowTimeCustom").catch((e) => {
        console.error("Failed to get imgShowTimeCustom from persistent store:", e);
        return null;
    });

    const imgShowTimeStrs = imgShowTimes.map((time) => time.toString());

    // Validate session store values
    if (typeof imgFolder === "string") {
        sessionStore.imgFolder = imgFolder;
    }
    if (
        typeof imgShowTimeSelected === "string" &&
        (imgShowTimeSelected === "custom" || imgShowTimeStrs.includes(imgShowTimeSelected))
    ) {
        sessionStore.imgShowTimeSelected = imgShowTimeSelected;
    }
    if (
        typeof imgShowTimeCustom === "number" &&
        Number.isInteger(imgShowTimeCustom) &&
        imgShowTimeCustom > 0 &&
        imgShowTimeCustom <= maxImgShowTime
    ) {
        sessionStore.imgShowTimeCustom = imgShowTimeCustom;
    }
}

export const load: LayoutLoad = async () => {
    await loadPersistentStore();
};
