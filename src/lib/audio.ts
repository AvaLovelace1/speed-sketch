import startAudioFile from "$lib/assets/audio/start.mp3";
import endAudioFile from "$lib/assets/audio/end.mp3";
import countdownBeepFile from "$lib/assets/audio/countdown-beep.mp3";
import countdownDoneFile from "$lib/assets/audio/countdown-done.mp3";
import { appSettings } from "$lib/store/app-settings.svelte";
import { Howl, Howler } from "howler";

const startAudio = new Howl({ src: [startAudioFile] });
const endAudio = new Howl({ src: [endAudioFile] });
const countdownBeep = new Howl({ src: [countdownBeepFile] });
const countdownDone = new Howl({ src: [countdownDoneFile] });

async function playAudio(audio: Howl) {
    Howler.volume(appSettings.volume);
    audio.play();
}

export async function playStartAudio() {
    await playAudio(startAudio);
}

export async function playEndAudio() {
    await playAudio(endAudio);
}

export async function playCountdownBeep() {
    await playAudio(countdownBeep);
}

export async function playCountdownDone() {
    await playAudio(countdownDone);
}
