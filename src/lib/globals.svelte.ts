import { getImgShowTime } from "$lib/session-settings.svelte";

export interface Image {
    url: string;
    // Path to the image file (for local files). Can be converted to a URL using convertFileSrc.
    path?: string;
}

// Global state for the application
export const sessionStore = $state({
    imgs: [] as Image[],
    imgShowTime: getImgShowTime(),
    nCompletedImgs: 0,
    timeSpent: 0,
});
