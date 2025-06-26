import { type PersistentStore } from "$lib/persistent-store.svelte";
import { validateString, validateInteger } from "$lib/utils.svelte";
import parse from "parse-duration";

// Exactly 0 or 1 of these should be "Custom", and the rest should be a valid duration string
export const imgShowTimeOptions = ["30s", "45s", "1m", "2m", "5m", "10m", "Custom"];
export const maxImgShowTime = 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s

export interface SessionSettings {
    // Path to the folder containing images
    imgFolder: string;
    // Whether to include subfolders when searching for images
    includeSubfolders: boolean;
    // Whether session images should be shuffled
    shuffleImgs: boolean;
    // User's selected image show time (a premade time or "Custom")
    imgShowTimeOption: string;
    // Custom image show time in seconds (if "Custom" is selected)
    imgShowTimeCustom: number;
}

export const sessionSettings: SessionSettings = $state({
    imgFolder: "",
    includeSubfolders: false,
    shuffleImgs: true,
    imgShowTimeOption: imgShowTimeOptions[0],
    imgShowTimeCustom: Math.floor((parse(imgShowTimeOptions[0]) as number) / 1000),
});

// Load session settings from a store with validation
export async function loadSessionSettings(store: PersistentStore) {
    await loadWithValidation(store, "imgFolder", (v: unknown) => typeof v === "string");
    await loadWithValidation(store, "includeSubfolders", (v: unknown) => typeof v === "boolean");
    await loadWithValidation(store, "shuffleImgs", (v: unknown) => typeof v === "boolean");
    await loadWithValidation(store, "imgShowTimeOption", (v: unknown) =>
        validateString(v, imgShowTimeOptions),
    );
    await loadWithValidation(store, "imgShowTimeCustom", (v: unknown) =>
        validateInteger(v, 1, maxImgShowTime),
    );
}

async function loadWithValidation(
    store: PersistentStore,
    settingName: keyof SessionSettings,
    validateFn: (v: unknown) => boolean,
) {
    await store
        .get(settingName)
        .then((value) => {
            // @ts-expect-error assumes validateFn validates the type of value
            if (validateFn(value)) sessionSettings[settingName] = value;
            else console.warn(`Skipped loading ${settingName} because of invalid value:`, value);
        })
        .catch((e) => {
            console.error(`Failed to get ${settingName} from persistent store:`, e);
        });
}

export async function saveSessionSettings(store: PersistentStore) {
    for (const key in sessionSettings) {
        await store.set(key, sessionSettings[key as keyof SessionSettings]).catch((e) => {
            console.error(`Failed to save ${key} to persistent store:`, e);
        });
    }
    await store.save().catch((e) => {
        console.error("Failed to save persistent store to disk:", e);
    });
}

export function getImgShowTime() {
    if (sessionSettings.imgShowTimeOption === "Custom") {
        return sessionSettings.imgShowTimeCustom;
    } else {
        return Math.floor((parse(sessionSettings.imgShowTimeOption) as number) / 1000);
    }
}
