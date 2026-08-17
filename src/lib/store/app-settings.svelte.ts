import * as z from "zod";
import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
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

    static get THEME_NAMES() {
        return AppSettings.THEMES.map((theme) => theme.name);
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

    static readonly MAX_GRID_DIM = 99;
    static readonly MIN_VIDEO_PLAYBACK_RATE = 0.25;
    static readonly MAX_VIDEO_PLAYBACK_RATE = 2; // Speeds more than 2x don't work well on Safari
    static readonly VIDEO_PLAYBACK_RATE_STEP = 0.25;

    static get DEFAULTS() {
        return {
            theme: "system",
            volume: 1.0,
            contrastStrength: Math.ceil(AppSettings.CONTRAST_OPTIONS.length / 2) - 1,
            blurStrength: Math.ceil(AppSettings.BLUR_OPTIONS.length / 2) - 1,
            gridRows: 5,
            gridCols: 10,
            videoPlaybackRate: 1.0,
        };
    }

    static get SCHEMA() {
        const defaults = AppSettings.DEFAULTS;
        return z.object({
            theme: z.enum(AppSettings.THEME_NAMES).catch(defaults.theme),
            volume: z.number().gte(0).lte(1).catch(defaults.volume),
            contrastStrength: z
                .int()
                .gte(0)
                .lt(AppSettings.CONTRAST_OPTIONS.length)
                .catch(defaults.contrastStrength),
            blurStrength: z
                .int()
                .gte(0)
                .lt(AppSettings.BLUR_OPTIONS.length)
                .catch(defaults.blurStrength),
            gridRows: z.int().gte(1).lte(AppSettings.MAX_GRID_DIM).catch(defaults.gridRows),
            gridCols: z.int().gte(1).lte(AppSettings.MAX_GRID_DIM).catch(defaults.gridCols),
            videoPlaybackRate: z
                .number()
                .gte(AppSettings.MIN_VIDEO_PLAYBACK_RATE)
                .lte(AppSettings.MAX_VIDEO_PLAYBACK_RATE)
                .catch(defaults.videoPlaybackRate),
        });
    }

    theme: string;
    volume: number;
    contrastStrength: number;
    blurStrength: number;
    gridRows: number;
    gridCols: number;
    videoPlaybackRate: number;
    [key: string]: unknown;

    constructor(entries = AppSettings.DEFAULTS) {
        this.theme = $state(entries.theme);
        this.volume = $state(entries.volume);
        this.contrastStrength = $state(entries.contrastStrength);
        this.blurStrength = $state(entries.blurStrength);
        this.gridRows = $state(entries.gridRows);
        this.gridCols = $state(entries.gridCols);
        this.videoPlaybackRate = $state(entries.videoPlaybackRate);
    }

    // Removes Svelte reactivity from data key-value pairs
    toPlainObject() {
        const data: Record<string, unknown> = {};
        for (const key of Object.keys(AppSettings.SCHEMA.shape)) {
            data[key] = $state.snapshot(this[key]);
        }
        return data;
    }

    async loadFromStore(persistentStore?: PersistentStore) {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, AppSettings.SCHEMA);
        await validatedStore.loadInto(this);
    }

    async saveToStore(persistentStore?: PersistentStore) {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, AppSettings.SCHEMA);
        await validatedStore.save(this.toPlainObject());
    }

    get contrastClass() {
        return AppSettings.CONTRAST_OPTIONS[this.contrastStrength];
    }

    get blurClass() {
        return AppSettings.BLUR_OPTIONS[this.blurStrength];
    }
}

export type AppSettingsEntries = z.infer<typeof AppSettings.SCHEMA>;

export const appSettings = $state(new AppSettings());

export const appSettingsDialog = $state({
    component: null as SettingsDialog | null,
});
