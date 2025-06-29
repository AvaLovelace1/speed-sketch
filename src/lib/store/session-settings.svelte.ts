import parse from "parse-duration";
import { validateString, validateInteger } from "$lib/utils.svelte";
import { getStore, type PersistentStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";
import { stat } from "@tauri-apps/plugin-fs";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";

export class SessionSettings implements Record<string, unknown> {
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
                key: "imgShowTimeOption",
                isValid: (v: unknown): v is string => validateString(v, this.IMG_SHOW_TIME_OPTIONS),
            },
            {
                key: "imgShowTimeCustom",
                isValid: (v: unknown): v is number => validateInteger(v, 1, this.MAX_IMG_SHOW_TIME),
            },
        ];
    }

    imgFolder: string;
    includeSubfolders: boolean;
    shuffleImgs: boolean;
    imgShowTimeOption: string;
    imgShowTimeCustom: number;
    [key: string]: unknown;

    constructor({
        imgFolder = "",
        includeSubfolders = true,
        shuffleImgs = true,
        imgShowTimeOption = this.IMG_SHOW_TIME_OPTIONS[0],
        imgShowTimeCustom = Math.floor((parse(this.IMG_SHOW_TIME_OPTIONS[0]) as number) / 1000),
    } = {}) {
        this.imgFolder = $state(imgFolder);
        this.includeSubfolders = $state(includeSubfolders);
        this.shuffleImgs = $state(shuffleImgs);
        this.imgShowTimeOption = $state(imgShowTimeOption);
        this.imgShowTimeCustom = $state(imgShowTimeCustom);
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

    // Get all image paths from the specified folder, converted to path URLs.
    getImgsTauri = async () => {
        // Check if the folder is set
        if (this.imgFolder === "") throw new Error("Please choose a folder");

        // Check if the folder exists and is a directory
        const metadata = await stat(this.imgFolder).catch((err) => {
            console.error("Error getting folder metadata:", err);
            throw new Error("Cannot access folder", { cause: err });
        });
        if (!metadata.isDirectory) throw new Error("Path is not a folder");

        // Load images from the folder
        const files = (await invoke("get_img_files", {
            dir: this.imgFolder,
            includeSubdirs: sessionSettings.includeSubfolders,
            shuffle: sessionSettings.shuffleImgs,
            timeoutDuration: 60,
        }).catch((e) => {
            console.error("Error loading images:", e);
            if (e === "TimeoutError") throw new Error("Loading images timed out", { cause: e });
            if (e === "TaskJoinError") throw new Error("Failed to load images", { cause: e });
            throw e;
        })) as string[];
        const imgs = files.map((file) => ({ url: convertFileSrc(file), path: file }));
        if (imgs.length === 0) throw new Error("No images found in folder");
        return imgs;
    };
}

export const sessionSettings = $state(new SessionSettings());
