// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import type { LayoutLoad } from "./$types";
import { load as loadStore } from "@tauri-apps/plugin-store";
import { imgShowTimes, maxImgShowTime, sessionStore } from "$lib/globals.svelte";

async function loadPersistentStore() {
    const persistentStore = await loadStore("store.json", { autoSave: false });
    const imgFolder = await persistentStore.get("imgFolder");
    const imgShowTimeSelected = await persistentStore.get("imgShowTimeSelected");
    const imgShowTimeCustom = await persistentStore.get("imgShowTimeCustom");

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
