import { getImgShowTime } from "$lib/session-settings.svelte";

// Appears on the title screen
export const appName = "SpeedSketch";
// Appears on the title screen below the app name
export const tagline = "timed drawing sessions";

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
