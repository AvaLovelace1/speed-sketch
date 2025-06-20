// Appears on the title screen
export const appName = "SpeedSketch";
// Appears on the title screen below the app name
export const tagline = "timed drawing sessions";
export const imgShowTimes = [30, 45, 60, 120, 300, 600];
export const maxImgShowTime = 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s

// Global state for the application
export const sessionStore = $state({
    imgFolder: "",
    imgPaths: [] as string[],
    imgShowTime: imgShowTimes[0],
    imgShowTimeSelected: imgShowTimes[0].toString(),
    imgShowTimeCustom: imgShowTimes[0],
    nCompletedImgs: 0,
    timeSpent: 0,
});
