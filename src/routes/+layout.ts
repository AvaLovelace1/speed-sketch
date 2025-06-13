// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

import type {LayoutLoad} from './$types';
import {load as loadStore} from '@tauri-apps/plugin-store';
import {maxImgShowTime, sessionStore} from '$lib/globals.svelte';

async function loadPersistentStore() {
    const persistentStore = await loadStore('store.json', {autoSave: false});
    const imgFolder = await persistentStore.get('imgFolder');
    const imgShowTime = await persistentStore.get('imgShowTime');
    if (typeof imgFolder === 'string') {
        sessionStore.imgFolder = imgFolder;
    }
    if (typeof imgShowTime === 'number' && Number.isInteger(imgShowTime)
        && imgShowTime > 0 && imgShowTime <= maxImgShowTime) {
        sessionStore.imgShowTime = imgShowTime;
    }
}

export const load: LayoutLoad = async () => {
    await loadPersistentStore();
}
