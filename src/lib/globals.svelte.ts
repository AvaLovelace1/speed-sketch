// Appears on the title screen
export const appName = "SpeedSketch";
// Appears on the title screen below the app name
export const tagline = "timed drawing sessions";
export const imgShowTimes = [30, 45, 60, 120, 300, 600];
export const maxImgShowTime = 99 * 60 ** 2 + 59 * 60 + 59; // 99h59m59s

// Global state for the application
export const sessionStore = $state({
    imgFolder: "",
    imgPaths: [] as string[],
    imgShowTime: 30,
    nCompletedImgs: 0,
    timeSpent: 0,
});
