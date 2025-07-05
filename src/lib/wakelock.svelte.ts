import { start, stop } from "tauri-plugin-keepawake-api";
import { isTauri } from "@tauri-apps/api/core";

let wakeLock: WakeLockSentinel | null = null;

export async function startWakelock() {
    if (isTauri()) await start({ display: true, idle: true, sleep: true });
    else wakeLock = await navigator.wakeLock.request("screen");
}

export async function stopWakelock() {
    if (isTauri()) await stop();
    else if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
    }
}
