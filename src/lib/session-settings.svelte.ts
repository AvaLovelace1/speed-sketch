import { type PersistentStore } from "$lib/persistent-store.svelte";
import { validateString, validateInteger } from "$lib/utils.svelte";

export const imgShowTimes = [30, 45, 60, 120, 300, 600];
export const maxImgShowTime = 23 * 60 ** 2 + 59 * 60 + 59; // 23h59m59s

interface SessionSettings {
    // Path to the folder containing images
    imgFolder: string;
    // User's selected image show time (a premade time or "custom")
    imgShowTimeSelected: string;
    // Custom image show time in seconds (if "custom" is selected)
    imgShowTimeCustom: number;
}

export const sessionSettings: SessionSettings = $state({
    imgFolder: "",
    imgShowTimeSelected: imgShowTimes[0].toString(),
    imgShowTimeCustom: imgShowTimes[0],
});

// Load session settings from a store with validation
export async function loadSessionSettings(store: PersistentStore) {
    await loadWithValidation(store, "imgFolder", (v: unknown) => typeof v === "string");
    await loadWithValidation(store, "imgShowTimeSelected", (v: unknown) =>
        validateString(v, imgShowTimes.map((time) => time.toString()).concat("custom")),
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
