// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import type { LayoutLoad } from "./$types";
import { load as loadStore } from "@tauri-apps/plugin-store";
import { imgShowTimes, maxImgShowTime, settings, sessionStore } from "$lib/globals.svelte";

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
    const theme = await persistentStore.get("theme").catch((e) => {
        console.error("Failed to get theme from persistent store:", e);
        return null;
    });
    const volume = await persistentStore.get("volume").catch((e) => {
        console.error("Failed to get volume from persistent store:", e);
        return null;
    });
    const contrastStrength = await persistentStore.get("contrastStrength").catch((e) => {
        console.error("Failed to get contrastStrength from persistent store:", e);
        return null;
    });
    const blurStrength = await persistentStore.get("blurStrength").catch((e) => {
        console.error("Failed to get blurStrength from persistent store:", e);
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

    if (theme === "system" || theme === "light" || theme === "dark") {
        settings.theme = theme;
    }
    if (typeof volume === "number" && volume >= 0 && volume <= 1) {
        settings.volume = volume;
    }
    if (
        typeof contrastStrength === "number" &&
        Number.isInteger(contrastStrength) &&
        contrastStrength >= 0 &&
        contrastStrength <= 9
    ) {
        settings.contrastStrength = contrastStrength;
    }
    if (
        typeof blurStrength === "number" &&
        Number.isInteger(blurStrength) &&
        blurStrength >= 0 &&
        blurStrength <= 3
    ) {
        settings.blurStrength = blurStrength;
    }
}

export const load: LayoutLoad = async () => {
    await loadPersistentStore();
};
