// Appears on the title screen
export const appName = "SpeedSketch";
// Appears on the title screen below the app name
export const tagline = "timed drawing sessions";
export const imgShowTimes = [30, 45, 60, 120, 300, 600];
export const maxImgShowTime = 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s

export interface Theme {
    // Unique identifier for the theme
    name: string;
    // Human-readable name for the theme
    label: string;
    icon?: string;
}

export const themes = [
    { name: "system", label: "Auto (system setting)", icon: "lucide--monitor" },
    { name: "light", label: "Light", icon: "lucide--sun" },
    { name: "dark", label: "Dark", icon: "lucide--moon" },
] as Theme[];

export interface Image {
    url: string;
    // Path to the image file (for local files). Can be converted to a URL using convertFileSrc.
    path?: string;
}

// Global settings
export const settings = $state({
    theme: "system",
});

// Global state for the application
export const sessionStore = $state({
    imgFolder: "",
    imgs: [] as Image[],
    imgShowTime: imgShowTimes[0],
    imgShowTimeSelected: imgShowTimes[0].toString(),
    imgShowTimeCustom: imgShowTimes[0],
    nCompletedImgs: 0,
    timeSpent: 0,
});
