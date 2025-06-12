export const appName = 'SpeedSketch';
export const tagline = 'timed drawing sessions';
export const imgShowTimes = [30, 45, 60, 120, 300, 600];

export const sessionStore = $state({
    imgFolder: '',
    imgFiles: [] as string[],
    imgShowTime: 30,
});
