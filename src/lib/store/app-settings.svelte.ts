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

export class AppSettings implements Record<string, unknown> {
    // Exactly 0 or 1 of these should be "Custom", and the rest should be a valid duration string
    get THEMES() {
        return [
            { name: "system", label: "Auto (system setting)", icon: "lucide--monitor" },
            { name: "light", label: "Light", icon: "lucide--sun" },
            { name: "dark", label: "Dark", icon: "lucide--moon" },
        ] as Theme[];
    }
    get CONTRAST_OPTIONS() {
        return [
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
    }

    get BLUR_OPTIONS() {
        return ["blur-xs", "blur-sm", "blur-md", "blur-lg"];
    }

    get #KEYS() {
        return [
            {
                key: "theme",
                isValid: (v: unknown) => {
                    return validateString(
                        v,
                        this.THEMES.map((theme) => theme.name),
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
                    return validateInteger(v, 0, this.CONTRAST_OPTIONS.length - 1);
                },
            },
            {
                key: "blurStrength",
                isValid: (v: unknown) => {
                    return validateInteger(v, 0, this.BLUR_OPTIONS.length - 1);
                },
            },
        ];
    }

    theme: string;
    volume: number;
    contrastStrength: number;
    blurStrength: number;
    [key: string]: unknown;

    constructor({ theme = "system", volume = 1, contrastStrength = 4, blurStrength = 1 } = {}) {
        this.theme = $state(theme);
        this.volume = $state(volume);
        this.contrastStrength = $state(contrastStrength);
        this.blurStrength = $state(blurStrength);
    }

    loadFromStore = async (persistentStore?: PersistentStore) => {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, this.#KEYS);
        await validatedStore.loadInto(this);
    };

    saveToStore = async (persistentStore?: PersistentStore) => {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, this.#KEYS);
        await validatedStore.save(this);
    };

    get contrastClass() {
        return this.CONTRAST_OPTIONS[this.contrastStrength];
    }

    get blurClass() {
        return this.BLUR_OPTIONS[this.blurStrength];
    }
}

export const appSettings = $state(new AppSettings());

export const appSettingsDialog = $state({
    component: null as SettingsDialog | null,
});
