import parse from "parse-duration";
import { validateString, validateInteger, basename, fisherYatesShuffle } from "$lib/utils.svelte";
import { getStore, type PersistentStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";
import { convertFileSrc, invoke, isTauri } from "@tauri-apps/api/core";
import { compareImages, type Image } from "$lib/types.svelte";
import type { SessionSchedule } from "$lib/drawing-session.svelte";

export class SessionSettings implements Record<string, unknown> {
    get SESSION_TYPES() {
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
    get IMG_SHOW_TIME_OPTIONS() {
        return ["30s", "45s", "1m", "2m", "5m", "10m", "Custom"];
    }

    get MAX_IMG_SHOW_TIME() {
        return 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s
    }

    get #KEYS() {
        return [
            {
                key: "imgFolder",
                isValid: (v: unknown): v is string => typeof v === "string",
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
                key: "sessionType",
                isValid: (v: unknown): v is string =>
                    validateString(
                        v,
                        this.SESSION_TYPES.map((t) => t.name),
                    ),
            },
            {
                key: "imgShowTimeOption",
                isValid: (v: unknown): v is string => validateString(v, this.IMG_SHOW_TIME_OPTIONS),
            },
            {
                key: "imgShowTimeCustom",
                isValid: (v: unknown): v is number => validateInteger(v, 1, this.MAX_IMG_SHOW_TIME),
            },
            {
                key: "sessionScheduleCustom",
                isValid: (v: unknown): v is SessionSchedule => {
                    if (!Array.isArray(v)) return false;
                    for (let i = 0; i < v.length; i++) {
                        if (!validateInteger(v[i].duration, 1, this.MAX_IMG_SHOW_TIME))
                            return false;
                        if (!validateInteger(v[i].repeat, 1, Infinity)) return false;
                        v[i].id = self.crypto.randomUUID();
                    }
                    return true;
                },
            },
        ];
    }

    // Folder containing images to show
    imgFolder: string;
    // Array of images to show, to be used if imgFolder is not set
    #imgs: Image[];
    // Whether to include images from subfolders. Has no effect if imgFolder is not set
    includeSubfolders: boolean;
    // Whether to shuffle images before showing them
    shuffleImgs: boolean;
    sessionType: string;
    imgShowTimeOption: string;
    imgShowTimeCustom: number;
    sessionScheduleCustom: SessionSchedule;

    [key: string]: unknown;

    get imgs(): Image[] {
        return this.#imgs;
    }

    set imgs(value: Image[]) {
        // Sort images before setting them
        this.#imgs = [...value].sort(compareImages);
    }

    constructor({
        imgFolder = "",
        imgs = [],
        includeSubfolders = true,
        shuffleImgs = true,
        sessionType = this.SESSION_TYPES[0].name,
        imgShowTimeOption = this.IMG_SHOW_TIME_OPTIONS[0],
        imgShowTimeCustom = Math.floor((parse(this.IMG_SHOW_TIME_OPTIONS[0]) as number) / 1000),
        sessionScheduleCustom = [] as SessionSchedule,
    } = {}) {
        this.imgFolder = $state(imgFolder);
        this.#imgs = [];
        this.imgs = imgs;
        this.includeSubfolders = $state(includeSubfolders);
        this.shuffleImgs = $state(shuffleImgs);
        this.sessionType = $state(sessionType);
        this.imgShowTimeOption = $state(imgShowTimeOption);
        this.imgShowTimeCustom = $state(imgShowTimeCustom);
        this.sessionScheduleCustom = $state(sessionScheduleCustom);
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

    get imgShowTime() {
        if (this.imgShowTimeOption === "Custom") {
            return this.imgShowTimeCustom;
        } else {
            return Math.floor((parse(this.imgShowTimeOption) as number) / 1000);
        }
    }

    get sessionSchedule(): SessionSchedule {
        if (this.sessionType === "Endless") {
            return [{ duration: this.imgShowTime, repeat: Infinity }];
        } else {
            return this.sessionScheduleCustom;
        }
    }

    getImgs = async () => {
        if (this.imgFolder !== "" && isTauri()) this.imgs = await this.getImgsFromFolder();
        const imgs = [...this.imgs];
        if (imgs.length === 0) throw new Error("No images found");
        if (this.shuffleImgs) fisherYatesShuffle(imgs);
        return imgs;
    };

    // Get all image paths from the specified folder, converted to path URLs.
    getImgsFromFolder = async () => {
        const files = (await invoke("get_img_files", {
            dir: this.imgFolder,
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

        const imgs: Image[] = files.map((file) => ({
            name: basename(file),
            url: convertFileSrc(file),
            path: file,
        }));
        return imgs;
    };
}

export const sessionSettings = $state(new SessionSettings());
