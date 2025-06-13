export const appName = 'SpeedSketch';
export const tagline = 'timed drawing sessions';
export const imgShowTimes = [30, 45, 60, 120, 300, 600];
export const maxImgShowTime = 99 * 60 * 60 + 59 * 60 + 59; // 99h59m59s


export const sessionStore = $state({
    imgFolder: '',
    imgFiles: [] as string[],
    imgShowTime: 30,
});
