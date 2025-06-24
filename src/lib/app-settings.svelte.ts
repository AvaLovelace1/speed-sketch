import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";

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

export const contrastOptions = [
    "contrast-200",
    "contrast-300",
    "contrast-400",
    "contrast-500",
    "contrast-600",
    "contrast-700",
    "contrast-800",
    "contrast-900",
    "contrast-1000",
];
export const blurOptions = ["blur-xs", "blur-sm", "blur-md", "blur-lg"];

export const appSettings = $state({
    theme: "system",
    volume: 1,
    contrastStrength: 3,
    blurStrength: 1,
    dialog: undefined as SettingsDialog | undefined,
});
