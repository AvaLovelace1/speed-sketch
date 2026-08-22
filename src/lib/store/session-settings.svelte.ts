import parse from "parse-duration";
import * as z from "zod";
import { basename, fisherYatesShuffle, isVideoFile } from "$lib/utils.svelte";
import { getStore, type PersistentStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";
import { convertFileSrc, invoke, isTauri } from "@tauri-apps/api/core";
import { compareImages, type Image } from "$lib/types.svelte";
import { SvelteSet } from "svelte/reactivity";

export class SessionSettings implements Record<string, unknown> {
    static get SESSION_MODES() {
        return [
            {
                name: "Endless",
                description: "Fixed time for each drawing",
            },
            {
                name: "Class",
                description: "Create your own schedule",
            },
        ];
    }

    static get SESSION_MODE_NAMES() {
        return SessionSettings.SESSION_MODES.map((mode) => mode.name);
    }

    // Exactly 0 or 1 of these should be "Custom", and the rest should be a valid duration string
    static get IMG_SHOW_TIME_OPTIONS() {
        return ["30s", "45s", "1m", "2m", "5m", "10m", "Custom"];
    }

    static readonly MAX_IMG_SHOW_TIME = 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s

    // Failures reported by the `get_img_files` command
    static get SCAN_ERRS(): Record<string, string> {
        return {
            DoesNotExist: "Folder does not exist",
            NotADirectory: "Path is not a folder",
            PathError: "Cannot access folder",
            TimeoutError: "Loading references timed out",
            TaskJoinError: "Failed to load references",
        };
    }

    static get DEFAULT_PRESET() {
        return {
            name: "Default Preset",
            schedule: [
                { duration: 60, repeat: 5, id: "1m x 5" },
                { duration: 120, repeat: 5, id: "2m x 5" },
                { duration: 300, repeat: 2, id: "5m x 2" },
                { duration: 600, repeat: 1, id: "10m x 1" },
            ],
        };
    }

    static get DEFAULTS() {
        return {
            imgFolders: [] as string[],
            includeSubfolders: true,
            shuffleImgs: true,
            sessionMode: SessionSettings.SESSION_MODES[0].name,
            imgShowTimeOption: SessionSettings.IMG_SHOW_TIME_OPTIONS[0],
            imgShowTimeCustom: Math.floor(
                (parse(SessionSettings.IMG_SHOW_TIME_OPTIONS[0]) as number) / 1000,
            ),
            schedulePresets: [SessionSettings.DEFAULT_PRESET] as SchedulePreset[],
            selectedScheduleIdx: 0,
        };
    }

    static get SCHEMA() {
        const defaults = SessionSettings.DEFAULTS;
        return z.object({
            imgFolders: z.array(z.string()).catch(defaults.imgFolders),
            includeSubfolders: z.boolean().catch(defaults.includeSubfolders),
            shuffleImgs: z.boolean().catch(defaults.shuffleImgs),
            sessionMode: z.enum(SessionSettings.SESSION_MODE_NAMES).catch(defaults.sessionMode),
            imgShowTimeOption: z
                .enum(SessionSettings.IMG_SHOW_TIME_OPTIONS)
                .catch(defaults.imgShowTimeOption),
            imgShowTimeCustom: z
                .int()
                .gte(1)
                .lte(SessionSettings.MAX_IMG_SHOW_TIME)
                .catch(defaults.imgShowTimeCustom),
            schedulePresets: z
                .array(SessionSettings.SCHEDULE_PRESET_SCHEMA)
                .catch(defaults.schedulePresets),
            selectedScheduleIdx: z.int().gte(0).catch(defaults.selectedScheduleIdx),
        });
    }

    static get SCHEDULE_PRESET_SCHEMA() {
        return z.object({
            name: z.string().catch("Preset"),
            schedule: SessionSettings.SESSION_SCHEDULE_SCHEMA.catch(
                SessionSettings.DEFAULT_PRESET.schedule,
            ),
        });
    }

    static get SESSION_SCHEDULE_SCHEMA() {
        return z.array(SessionSettings.SCHEDULE_ENTRY_SCHEMA).refine((schedule) => {
            const uniqueIds = new SvelteSet(schedule.map((entry) => entry.id));
            return uniqueIds.size === schedule.length;
        });
    }

    static get SCHEDULE_ENTRY_SCHEMA() {
        return z.object({
            duration: z.int().gte(1).lte(SessionSettings.MAX_IMG_SHOW_TIME).catch(60),
            repeat: z.int().gte(1).catch(1),
            id: z.string(),
            isBreak: z.boolean().optional().catch(false),
        });
    }

    // Folders containing images to show
    imgFolders: string[];
    // Array of images to show, to be used if imgFolders is empty
    #imgs: Image[];
    // Whether to include images from subfolders. Has no effect if imgFolders is empty
    includeSubfolders: boolean;
    // Whether to shuffle images before showing them
    shuffleImgs: boolean;
    sessionMode: string;
    imgShowTimeOption: string;
    imgShowTimeCustom: number;
    schedulePresets: SchedulePreset[];
    // -1 if no schedule selected
    selectedScheduleIdx: number;
    [key: string]: unknown;

    constructor({
        imgFolders = SessionSettings.DEFAULTS.imgFolders,
        includeSubfolders = SessionSettings.DEFAULTS.includeSubfolders,
        shuffleImgs = SessionSettings.DEFAULTS.shuffleImgs,
        sessionMode = SessionSettings.DEFAULTS.sessionMode,
        imgShowTimeOption = SessionSettings.DEFAULTS.imgShowTimeOption,
        imgShowTimeCustom = SessionSettings.DEFAULTS.imgShowTimeCustom,
        schedulePresets = SessionSettings.DEFAULTS.schedulePresets,
        selectedScheduleIdx = SessionSettings.DEFAULTS.selectedScheduleIdx,
    } = {}) {
        this.imgFolders = $state(imgFolders);
        this.#imgs = [];
        this.includeSubfolders = $state(includeSubfolders);
        this.shuffleImgs = $state(shuffleImgs);
        this.sessionMode = $state(sessionMode);
        this.imgShowTimeOption = $state(imgShowTimeOption);
        this.imgShowTimeCustom = $state(imgShowTimeCustom);
        this.schedulePresets = $state(schedulePresets);
        this.selectedScheduleIdx = $state(selectedScheduleIdx);
    }

    // Removes Svelte reactivity from data key-value pairs
    toPlainObject() {
        const data: Record<string, unknown> = {};
        for (const key of Object.keys(SessionSettings.SCHEMA.shape)) {
            data[key] = $state.snapshot(this[key]);
        }
        return data;
    }

    async loadFromStore(persistentStore?: PersistentStore) {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, SessionSettings.SCHEMA);
        await validatedStore.loadInto(this);
        this.selectedScheduleIdx = Math.min(
            this.selectedScheduleIdx,
            this.schedulePresets.length - 1,
        );
    }

    async saveToStore(persistentStore?: PersistentStore) {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, SessionSettings.SCHEMA);
        await validatedStore.save(this.toPlainObject());
    }

    get imgs(): Image[] {
        return this.#imgs;
    }

    set imgs(value: Image[]) {
        this.#imgs = [...value];
    }

    get imgShowTime() {
        if (this.imgShowTimeOption === "Custom") {
            return this.imgShowTimeCustom;
        } else {
            return Math.floor((parse(this.imgShowTimeOption) as number) / 1000);
        }
    }

    get sessionSchedule() {
        if (this.sessionMode === "Endless") {
            return [{ duration: this.imgShowTime, repeat: Infinity, id: "endless" }];
        } else {
            return this.sessionScheduleCustom;
        }
    }

    get sessionScheduleCustom() {
        if (this.selectedScheduleIdx === -1) return undefined;
        return this.schedulePresets[this.selectedScheduleIdx].schedule;
    }

    selectSchedulePreset(idx: number) {
        if (idx < -1 || idx >= this.schedulePresets.length) {
            throw new Error(`Index out of range: ${idx}`);
        }
        this.selectedScheduleIdx = idx;
    }

    addSchedulePreset(name: string) {
        this.schedulePresets.push({ name, schedule: [] });
        this.selectedScheduleIdx = this.schedulePresets.length - 1;
    }

    renameSchedulePreset(name: string) {
        if (this.selectedScheduleIdx === -1) return;
        this.schedulePresets[this.selectedScheduleIdx].name = name;
    }

    removeSchedulePreset() {
        if (this.selectedScheduleIdx === -1) return;
        this.schedulePresets.splice(this.selectedScheduleIdx, 1);
        this.selectedScheduleIdx = Math.min(
            this.selectedScheduleIdx,
            this.schedulePresets.length - 1,
        );
    }

    async getImgs() {
        let folderErrs: Record<string, string> = {};
        if (isTauri()) {
            const result = await this.getImgsFromFolders();
            this.imgs = result.imgs;
            folderErrs = result.folderErrs;
        }
        const imgs = [...this.imgs];
        const globalErr = imgs.length === 0 ? "No references found" : "";
        if (this.shuffleImgs && imgs.length > 0) fisherYatesShuffle(imgs);
        return { imgs, globalErr, folderErrs };
    }

    // Get all image paths from the specified folders, converted to path URLs.
    // A folder that fails to load is reported in `folderErrs` (keyed by folder path) and skipped.
    async getImgsFromFolders() {
        const imgs: Image[] = [];
        const folderErrs: Record<string, string> = {};
        for (const imgFolder of this.imgFolders) {
            try {
                // Push instead of spreading to avoid overflowing the call stack for huge folders
                for (const img of await this.getImgsFromFolder(imgFolder)) imgs.push(img);
            } catch (e) {
                folderErrs[imgFolder] = e instanceof Error ? e.message : "Cannot load folder";
            }
        }
        return { imgs, folderErrs };
    }

    // Get all image paths from the specified folder, converted to path URLs.
    async getImgsFromFolder(imgFolder: string) {
        const files = (await invoke("get_img_files", {
            dir: imgFolder,
            includeSubdirs: this.includeSubfolders,
            timeoutDuration: 60,
        }).catch((e) => {
            const scanErr = typeof e === "string" ? SessionSettings.SCAN_ERRS[e] : undefined;
            if (!scanErr) throw e;
            throw new Error(scanErr, { cause: e });
        })) as string[];

        const imgs: Image[] = files
            .map((file) => ({
                name: basename(file),
                url: convertFileSrc(file),
                path: file,
                isVideo: isVideoFile(file),
            }))
            .sort(compareImages);
        return imgs;
    }
}

export type ScheduleEntry = z.infer<typeof SessionSettings.SCHEDULE_ENTRY_SCHEMA>;
export type SessionSchedule = z.infer<typeof SessionSettings.SESSION_SCHEDULE_SCHEMA>;
export type SchedulePreset = z.infer<typeof SessionSettings.SCHEDULE_PRESET_SCHEMA>;
export type SessionSettingsEntries = z.infer<typeof SessionSettings.SCHEMA>;

export function totalImgs(schedule: SessionSchedule) {
    return schedule.reduce((acc, entry) => acc + (entry.isBreak ? 0 : entry.repeat), 0);
}

export function totalDuration(schedule: SessionSchedule) {
    return schedule.reduce((acc, entry) => acc + entry.duration * entry.repeat, 0);
}

export const sessionSettings = $state(new SessionSettings());
