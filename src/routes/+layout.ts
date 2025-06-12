// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import type {LayoutLoad} from './$types';
import {load as loadStore} from '@tauri-apps/plugin-store';
import {sessionStore} from '$lib/globals.svelte';

async function loadPersistentStore() {
    const persistentStore = await loadStore('store.json', {autoSave: false});
    const imgFolder: string | undefined = await persistentStore.get('imgFolder');
    const imgShowTime: number | undefined = await persistentStore.get('imgShowTime');
    if (imgFolder !== undefined) sessionStore.imgFolder = imgFolder;
    if (imgShowTime !== undefined) sessionStore.imgShowTime = imgShowTime;
}

export const load: LayoutLoad = async () => {
    await loadPersistentStore();
}
