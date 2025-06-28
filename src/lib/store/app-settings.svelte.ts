import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
import { validateInteger, validateNumber, validateString } from "$lib/utils.svelte";
import { getStore, type PersistentStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";

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
    "contrast-125",
    "contrast-150",
    "contrast-175",
    "contrast-200",
    "contrast-250",
    "contrast-300",
    "contrast-375",
    "contrast-500",
    "contrast-800",
];
export const blurOptions = ["blur-xs", "blur-sm", "blur-md", "blur-lg"];

export const appSettings = $state({
    theme: "system",
    volume: 1,
    contrastStrength: 4,
    blurStrength: 1,
});

export const appSettingsDialog = $state({
    component: null as SettingsDialog | null,
});

const appSettingsKeys = [
    {
        key: "theme",
        isValid: (v: unknown) => {
            return validateString(
                v,
                themes.map((theme) => theme.name),
            );
        },
    },
    {
        key: "volume",
        isValid: (v: unknown) => {
            return validateNumber(v, 0, 1);
        },
    },
    {
        key: "contrastStrength",
        isValid: (v: unknown) => {
            return validateInteger(v, 0, contrastOptions.length - 1);
        },
    },
    {
        key: "blurStrength",
        isValid: (v: unknown) => {
            return validateInteger(v, 0, blurOptions.length - 1);
        },
    },
];

export async function loadAppSettings(persistentStore?: PersistentStore) {
    if (!persistentStore) persistentStore = await getStore();
    const appSettingsStore = new ValidatedStore(persistentStore, appSettingsKeys);
    await appSettingsStore.loadInto(appSettings);
}

export async function saveAppSettings(persistentStore?: PersistentStore) {
    if (!persistentStore) persistentStore = await getStore();
    const appSettingsStore = new ValidatedStore(persistentStore, appSettingsKeys);
    await appSettingsStore.save(appSettings);
}
