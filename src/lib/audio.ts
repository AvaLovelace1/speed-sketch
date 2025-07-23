import startAudioFile from "$lib/assets/audio/start.mp3";
import endAudioFile from "$lib/assets/audio/end.mp3";
import countdownBeepFile from "$lib/assets/audio/countdown-beep.mp3";
import countdownDoneFile from "$lib/assets/audio/countdown-done.mp3";
import { appSettings } from "$lib/store/app-settings.svelte";

async function playAudio(audioFile: string) {
    const audio = new Audio(audioFile);
    audio.volume = appSettings.volume;
    await audio.play().catch((e) => {
        console.error("Failed to play audio:", e);
    });
}

export async function playStartAudio() {
    await playAudio(startAudioFile);
}

export async function playEndAudio() {
    await playAudio(endAudioFile);
}

export async function playCountdownBeep() {
    await playAudio(countdownBeepFile);
}

export async function playCountdownDone() {
    await playAudio(countdownDoneFile);
}
