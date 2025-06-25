import { type PersistentStore } from "$lib/persistent-store.svelte";
import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
import { validateInteger, validateNumber, validateString } from "$lib/utils.svelte";

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

interface AppSettings {
    // Theme selected by the user
    theme: string;
    // Volume level for audio playback
    volume: number;
    // Strength of contrast filter applied to images
    contrastStrength: number;
    // Strength of blur filter applied to images
    blurStrength: number;
    // Currently open settings dialog, if any
    dialog?: SettingsDialog;
}

export const appSettings: AppSettings = $state({
    theme: "system",
    volume: 1,
    contrastStrength: 3,
    blurStrength: 1,
    dialog: undefined as SettingsDialog | undefined,
});

// Load session settings from a store with validation
export async function loadAppSettings(store: PersistentStore) {
    await loadWithValidation(store, "theme", (v: unknown) =>
        validateString(
            v,
            themes.map((theme) => theme.name),
        ),
    );
    await loadWithValidation(store, "volume", (v: unknown) => validateNumber(v, 0, 1));
    await loadWithValidation(store, "contrastStrength", (v: unknown) =>
        validateInteger(v, 0, contrastOptions.length - 1),
    );
    await loadWithValidation(store, "blurStrength", (v: unknown) =>
        validateInteger(v, 0, blurOptions.length - 1),
    );
}

async function loadWithValidation(
    store: PersistentStore,
    settingName: keyof AppSettings,
    validateFn: (v: unknown) => boolean,
) {
    await store
        .get(settingName)
        .then((value) => {
            // @ts-expect-error assumes validateFn validates the type of value
            if (validateFn(value)) appSettings[settingName] = value;
            else console.warn(`Skipped loading ${settingName} because of invalid value:`, value);
        })
        .catch((e) => {
            console.error(`Failed to get ${settingName} from persistent store:`, e);
        });
}

export async function saveAppSettings(store: PersistentStore) {
    for (const key in appSettings) {
        await store.set(key, appSettings[key as keyof AppSettings]).catch((e) => {
            console.error(`Failed to save ${key} to persistent store:`, e);
        });
    }
    await store.save().catch((e) => {
        console.error("Failed to save persistent store to disk:", e);
    });
}
