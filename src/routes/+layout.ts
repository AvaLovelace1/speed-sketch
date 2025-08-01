// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import type { LayoutLoad } from "./$types";
import { sessionSettings } from "$lib/store/session-settings.svelte";
import { appSettings } from "$lib/store/app-settings.svelte";

export const load: LayoutLoad = async () => {
    await sessionSettings.loadFromStore();
    await appSettings.loadFromStore();
};
