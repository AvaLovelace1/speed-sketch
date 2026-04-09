import parse from "parse-duration";
import { validateString, validateInteger, basename, fisherYatesShuffle } from "$lib/utils.svelte";
import { getStore, type PersistentStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";
import { convertFileSrc, invoke, isTauri } from "@tauri-apps/api/core";
import { compareImages, type Image } from "$lib/types.svelte";
import type { SessionSchedule } from "$lib/drawing-session.svelte";
import { SvelteSet } from "svelte/reactivity";

export type SchedulePreset = { name: string; schedule: SessionSchedule };

export class SessionSettings implements Record<string, unknown> {
    static get SESSION_MODES() {
        return [
            {
                name: "Endless",
                description: "Fixed time for each image",
            },
            {
                name: "Class",
                description: "Create your own schedule",
            },
        ];
    }

    // Exactly 0 or 1 of these should be "Custom", and the rest should be a valid duration string
    static get IMG_SHOW_TIME_OPTIONS() {
        return ["30s", "45s", "1m", "2m", "5m", "10m", "Custom"];
    }

    static readonly MAX_IMG_SHOW_TIME = 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s

    static readonly DEFAULT_PRESET_NAME = "Default Preset";

    static get DEFAULT_PRESET_SCHEDULE(): SessionSchedule {
        return [
            { duration: 60, repeat: 5, id: "1m x 5" },
            { duration: 120, repeat: 5, id: "2m x 5" },
            { duration: 300, repeat: 2, id: "5m x 2" },
            { duration: 600, repeat: 1, id: "10m x 1" },
        ];
    }

    static get DEFAULT_SAVED_SCHEDULES(): SchedulePreset[] {
        return [
            {
                name: SessionSettings.DEFAULT_PRESET_NAME,
                schedule: SessionSettings.DEFAULT_PRESET_SCHEDULE,
            },
        ];
    }

    static get #KEYS() {
        return [
            {
                key: "imgFolders",
                isValid: (v: unknown): v is string[] =>
                    Array.isArray(v) && v.every((item) => typeof item === "string"),
            },
            {
                key: "includeSubfolders",
                isValid: (v: unknown): v is boolean => typeof v === "boolean",
            },
            {
                key: "shuffleImgs",
                isValid: (v: unknown): v is boolean => typeof v === "boolean",
            },
            {
                key: "sessionMode",
                isValid: (v: unknown): v is string =>
                    validateString(
                        v,
                        SessionSettings.SESSION_MODES.map((t) => t.name),
                    ),
            },
            {
                key: "imgShowTimeOption",
                isValid: (v: unknown): v is string =>
                    validateString(v, SessionSettings.IMG_SHOW_TIME_OPTIONS),
            },
            {
                key: "imgShowTimeCustom",
                isValid: (v: unknown): v is number =>
                    validateInteger(v, 1, SessionSettings.MAX_IMG_SHOW_TIME),
            },
            {
                key: "schedulePresets",
                isValid: (v: unknown): v is SchedulePreset[] => {
                    if (!Array.isArray(v)) return false;
                    for (const entry of v) {
                        if (typeof entry !== "object" || entry === null) return false;
                        if (typeof entry.name !== "string") return false;
                        if (!SessionSettings.#isValidSessionSchedule(entry.schedule)) return false;
                    }
                    // Must contain at least one entry, and first entry must be "default preset"
                    return v.length > 0 && v[0].name === SessionSettings.DEFAULT_PRESET_NAME;
                },
            },
            {
                key: "selectedScheduleIdx",
                isValid: (v: unknown): v is number => validateInteger(v, 0, Infinity),
            },
        ];
    }

    static #isValidSessionSchedule(v: unknown): v is SessionSchedule {
        if (!Array.isArray(v)) return false;
        for (const item of v) {
            if (!validateInteger(item.duration, 1, SessionSettings.MAX_IMG_SHOW_TIME)) return false;
            if (!validateInteger(item.repeat, 1, Infinity)) return false;
            if (typeof item.id !== "string") return false;
        }
        const uniqueIds = new SvelteSet(v.map((s) => s.id));
        return uniqueIds.size === v.length;
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

    get sessionScheduleCustom(): SessionSchedule {
        return this.schedulePresets[this.selectedScheduleIdx].schedule;
    }

    get imgs(): Image[] {
        return this.#imgs;
    }

    set imgs(value: Image[]) {
        this.#imgs = [...value];
    }

    constructor({
        imgFolders = [] as string[],
        imgs = [],
        includeSubfolders = true,
        shuffleImgs = true,
        sessionMode = SessionSettings.SESSION_MODES[0].name,
        imgShowTimeOption = SessionSettings.IMG_SHOW_TIME_OPTIONS[0],
        imgShowTimeCustom = Math.floor(
            (parse(SessionSettings.IMG_SHOW_TIME_OPTIONS[0]) as number) / 1000,
        ),
        schedulePresets: schedulePresets = SessionSettings.DEFAULT_SAVED_SCHEDULES,
        selectedScheduleIdx = 0,
    } = {}) {
        this.imgFolders = $state(imgFolders);
        this.#imgs = [];
        this.imgs = imgs;
        this.includeSubfolders = $state(includeSubfolders);
        this.shuffleImgs = $state(shuffleImgs);
        this.sessionMode = $state(sessionMode);
        this.imgShowTimeOption = $state(imgShowTimeOption);
        this.imgShowTimeCustom = $state(imgShowTimeCustom);
        this.schedulePresets = $state(schedulePresets);
        this.selectedScheduleIdx = $state(selectedScheduleIdx);
    }

    loadFromStore = async (persistentStore?: PersistentStore) => {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, SessionSettings.#KEYS);
        await validatedStore.loadInto(this);
        // Clamp selectedScheduleIdx in case schedulePresets shrank
        this.selectedScheduleIdx = Math.min(
            this.selectedScheduleIdx,
            this.schedulePresets.length - 1,
        );
    };

    saveToStore = async (persistentStore?: PersistentStore) => {
        if (!persistentStore) persistentStore = await getStore();
        const validatedStore = new ValidatedStore(persistentStore, SessionSettings.#KEYS);
        await validatedStore.save(this);
    };

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

    removeSchedulePreset() {
        if (this.selectedScheduleIdx === 0) return; // Don't allow removing default preset
        this.schedulePresets.splice(this.selectedScheduleIdx, 1);
        this.selectedScheduleIdx = Math.min(
            this.selectedScheduleIdx,
            this.schedulePresets.length - 1,
        );
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
            return [{ duration: this.imgShowTime, repeat: Infinity }];
        } else {
            return this.sessionScheduleCustom;
        }
    }

    getImgs = async () => {
        if (isTauri()) this.imgs = await this.getImgsFromFolders();
        const imgs = [...this.imgs];
        if (imgs.length === 0) throw new Error("No images found");
        if (this.shuffleImgs) fisherYatesShuffle(imgs);
        return imgs;
    };

    // Get all image paths from the specified folders, converted to path URLs.
    getImgsFromFolders = async () => {
        const allImgs: Image[] = [];
        for (const imgFolder of this.imgFolders) {
            allImgs.push(...(await this.getImgsFromFolder(imgFolder)));
        }
        return allImgs;
    };

    // Get all image paths from the specified folder, converted to path URLs.
    getImgsFromFolder = async (imgFolder: string) => {
        const files = (await invoke("get_img_files", {
            dir: imgFolder,
            includeSubdirs: this.includeSubfolders,
            timeoutDuration: 60,
        }).catch((e) => {
            if (e === "DoesNotExist") throw new Error("Folder does not exist", { cause: e });
            if (e === "NotADirectory") throw new Error("Path is not a folder", { cause: e });
            if (e === "PathError") throw new Error("Cannot access folder", { cause: e });
            if (e === "TimeoutError") throw new Error("Loading images timed out", { cause: e });
            if (e === "TaskJoinError") throw new Error("Failed to load images", { cause: e });
            throw e;
        })) as string[];

        const imgs: Image[] = files
            .map((file) => ({
                name: basename(file),
                url: convertFileSrc(file),
                path: file,
            }))
            .sort(compareImages);
        return imgs;
    };
}

export const sessionSettings = $state(new SessionSettings());
