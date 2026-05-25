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
    static get THEMES() {
        return [
            { name: "system", label: "Auto (system setting)", icon: "lucide--monitor" },
            { name: "light", label: "Light", icon: "lucide--sun" },
            { name: "dark", label: "Dark", icon: "lucide--moon" },
        ] as Theme[];
    }

    static get CONTRAST_OPTIONS() {
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

    static get BLUR_OPTIONS() {
        return ["blur-xs", "blur-sm", "blur-md", "blur-lg"];
    }

    static readonly MIN_VIDEO_PLAYBACK_RATE = 0.25;
    static readonly MAX_VIDEO_PLAYBACK_RATE = 2; // Speeds more than 2x don't work well on Safari
    static readonly VIDEO_PLAYBACK_RATE_STEP = 0.25;

    get #KEYS() {
        return [
            {
                key: "theme",
                isValid: (v: unknown) => {
                    return validateString(
                        v,
                        AppSettings.THEMES.map((theme) => theme.name),
                    );
                },
            },
            {
                key: "volume",
                isValid: (v: unknown) => validateNumber(v, 0, 1),
            },
            {
                key: "contrastStrength",
                isValid: (v: unknown) =>
                    validateInteger(v, 0, AppSettings.CONTRAST_OPTIONS.length - 1),
            },
            {
                key: "blurStrength",
                isValid: (v: unknown) => validateInteger(v, 0, AppSettings.BLUR_OPTIONS.length - 1),
            },
            {
                key: "gridRows",
                isValid: (v: unknown) => validateInteger(v, 0, 99),
            },
            {
                key: "gridCols",
                isValid: (v: unknown) => validateInteger(v, 0, 99),
            },
            {
                key: "videoPlaybackRate",
                isValid: (v: unknown) =>
                    validateNumber(
                        v,
                        AppSettings.MIN_VIDEO_PLAYBACK_RATE,
                        AppSettings.MAX_VIDEO_PLAYBACK_RATE,
                    ),
            },
        ];
    }

    theme: string;
    volume: number;
    contrastStrength: number;
    blurStrength: number;
    gridRows: number;
    gridCols: number;
    videoPlaybackRate: number;
    [key: string]: unknown;

    constructor({
        theme = "system",
        volume = 1,
        contrastStrength = 4,
        blurStrength = 1,
        gridRows = 5,
        gridCols = 10,
        videoPlaybackRate = 1,
    } = {}) {
        this.theme = $state(theme);
        this.volume = $state(volume);
        this.contrastStrength = $state(contrastStrength);
        this.blurStrength = $state(blurStrength);
        this.gridRows = $state(gridRows);
        this.gridCols = $state(gridCols);
        this.videoPlaybackRate = $state(videoPlaybackRate);
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
        return AppSettings.CONTRAST_OPTIONS[this.contrastStrength];
    }

    get blurClass() {
        return AppSettings.BLUR_OPTIONS[this.blurStrength];
    }
}

export const appSettings = $state(new AppSettings());

export const appSettingsDialog = $state({
    component: null as SettingsDialog | null,
});
