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

    static readonly DEFAULT_PRESET_NAME = "Default Preset";
    static get DEFAULT_PRESET_SCHEDULE(): SessionSchedule {
        return [
            { duration: 60, repeat: 5, id: "1m x 5", isBreak: false },
            { duration: 120, repeat: 5, id: "2m x 5", isBreak: false },
            { duration: 300, repeat: 2, id: "5m x 2", isBreak: false },
            { duration: 600, repeat: 1, id: "10m x 1", isBreak: false },
        ];
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
            schedulePresets: [
                {
                    name: SessionSettings.DEFAULT_PRESET_NAME,
                    schedule: SessionSettings.DEFAULT_PRESET_SCHEDULE,
                },
            ],
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
                .refine(
                    (schedulePresets) =>
                        schedulePresets.length > 0 &&
                        schedulePresets[0].name === SessionSettings.DEFAULT_PRESET_NAME,
                )
                .catch(defaults.schedulePresets),
            selectedScheduleIdx: z.int().gte(0).catch(defaults.selectedScheduleIdx),
        });
    }

    static get SCHEDULE_PRESET_SCHEMA() {
        return z.object({
            name: z.string().catch("Preset"),
            schedule: SessionSettings.SESSION_SCHEDULE_SCHEMA.catch(
                SessionSettings.DEFAULT_PRESET_SCHEDULE,
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
            isBreak: z.boolean().catch(false),
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
    selectedScheduleIdx: number;
    [key: string]: unknown;

    constructor(entries = SessionSettings.DEFAULTS) {
        this.imgFolders = $state(entries.imgFolders);
        this.#imgs = [];
        this.includeSubfolders = $state(entries.includeSubfolders);
        this.shuffleImgs = $state(entries.shuffleImgs);
        this.sessionMode = $state(entries.sessionMode);
        this.imgShowTimeOption = $state(entries.imgShowTimeOption);
        this.imgShowTimeCustom = $state(entries.imgShowTimeCustom);
        this.schedulePresets = $state(entries.schedulePresets);
        this.selectedScheduleIdx = $state(entries.selectedScheduleIdx);
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

    get sessionSchedule(): SessionSchedule {
        if (this.sessionMode === "Endless") {
            return [
                { duration: this.imgShowTime, repeat: Infinity, id: "endless", isBreak: false },
            ];
        } else {
            return this.sessionScheduleCustom;
        }
    }

    get sessionScheduleCustom(): SessionSchedule {
        return this.schedulePresets[this.selectedScheduleIdx].schedule;
    }

    selectSchedulePreset(idx: number) {
        if (idx < 0 || idx >= this.schedulePresets.length) {
            throw new Error(`Index out of range: ${idx}`);
        }
        this.selectedScheduleIdx = idx;
    }

    addSchedulePreset(name: string) {
        this.schedulePresets.push({ name, schedule: [] });
        this.selectedScheduleIdx = this.schedulePresets.length - 1;
    }

    renameSchedulePreset(name: string) {
        if (this.selectedScheduleIdx === 0) return; // Don't allow renaming default preset
        this.schedulePresets[this.selectedScheduleIdx].name = name;
    }

    removeSchedulePreset() {
        if (this.selectedScheduleIdx === 0) return; // Don't allow removing default preset
        this.schedulePresets.splice(this.selectedScheduleIdx, 1);
        this.selectedScheduleIdx = Math.min(
            this.selectedScheduleIdx,
            this.schedulePresets.length - 1,
        );
    }

    async getImgs() {
        if (isTauri()) this.imgs = await this.getImgsFromFolders();
        const imgs = [...this.imgs];
        if (imgs.length === 0) throw new Error("No references found");
        if (this.shuffleImgs) fisherYatesShuffle(imgs);
        return imgs;
    }

    // Get all image paths from the specified folders, converted to path URLs.
    async getImgsFromFolders() {
        const allImgs: Image[] = [];
        for (const imgFolder of this.imgFolders) {
            // Push instead of spreading to avoid overflowing the call stack for huge folders
            for (const img of await this.getImgsFromFolder(imgFolder)) {
                allImgs.push(img);
            }
        }
        return allImgs;
    }

    // Get all image paths from the specified folder, converted to path URLs.
    async getImgsFromFolder(imgFolder: string) {
        const files = (await invoke("get_img_files", {
            dir: imgFolder,
            includeSubdirs: this.includeSubfolders,
            timeoutDuration: 60,
        }).catch((e) => {
            if (e === "DoesNotExist") throw new Error("Folder does not exist", { cause: e });
            if (e === "NotADirectory") throw new Error("Path is not a folder", { cause: e });
            if (e === "PathError") throw new Error("Cannot access folder", { cause: e });
            if (e === "TimeoutError") throw new Error("Loading references timed out", { cause: e });
            if (e === "TaskJoinError") throw new Error("Failed to load references", { cause: e });
            throw e;
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
