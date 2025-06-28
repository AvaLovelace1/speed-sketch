import parse from "parse-duration";
import { validateString, validateInteger } from "$lib/utils.svelte";
import { getStore, type PersistentStore } from "$lib/store/persistent-store.svelte";
import { ValidatedStore } from "$lib/store/validated-store.svelte";

// Exactly 0 or 1 of these should be "Custom", and the rest should be a valid duration string
export const imgShowTimeOptions = ["30s", "45s", "1m", "2m", "5m", "10m", "Custom"];
export const maxImgShowTime = 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s

export const sessionSettings = $state({
    imgFolder: "",
    includeSubfolders: false,
    shuffleImgs: true,
    imgShowTimeOption: imgShowTimeOptions[0],
    imgShowTimeCustom: Math.floor((parse(imgShowTimeOptions[0]) as number) / 1000),
});

const sessionSettingsKeys = [
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
        isValid: (v: unknown): v is string => validateString(v, imgShowTimeOptions),
    },
    {
        key: "imgShowTimeCustom",
        isValid: (v: unknown): v is number => validateInteger(v, 1, maxImgShowTime),
    },
];

export async function loadSessionSettings(persistentStore?: PersistentStore) {
    if (!persistentStore) persistentStore = await getStore();
    const appSettingsStore = new ValidatedStore(persistentStore, sessionSettingsKeys);
    await appSettingsStore.loadInto(sessionSettings);
}

export async function saveSessionSettings(persistentStore?: PersistentStore) {
    if (!persistentStore) persistentStore = await getStore();
    const appSettingsStore = new ValidatedStore(persistentStore, sessionSettingsKeys);
    await appSettingsStore.save(sessionSettings);
}

export function getImgShowTime() {
    if (sessionSettings.imgShowTimeOption === "Custom") {
        return sessionSettings.imgShowTimeCustom;
    } else {
        return Math.floor((parse(sessionSettings.imgShowTimeOption) as number) / 1000);
    }
}
