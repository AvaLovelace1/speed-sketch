function decomposeTime(seconds: number) {
    const hrs = Math.floor(Math.abs(seconds) / 60 / 60);
    const mins = Math.floor(Math.abs(seconds) / 60) % 60;
    const secs = Math.floor(Math.abs(seconds) % 60);
    return { hrs, mins, secs };
}

export function formatTimeHuman(seconds: number, space: boolean = false) {
    const { hrs, mins, secs } = decomposeTime(seconds);
    const hrsFmt = hrs ? `${hrs}h` : "";
    const minsFmt = mins ? `${mins}m` : "";
    const secsFmt = secs || seconds === 0 ? `${secs}s` : "";
    return `${hrsFmt}${space ? " " : ""}${minsFmt}${space ? " " : ""}${secsFmt}`.trim();
}

export function formatTimeClock(seconds: number) {
    const { hrs, mins, secs } = decomposeTime(seconds);
    const negative = seconds < 0;
    const minsFmt = hrs > 0 && mins < 10 ? `0${mins}` : mins;
    const secsFmt = secs < 10 ? `0${secs}` : secs;
    return `${negative ? "-" : ""}${hrs ? hrs + ":" : ""}${minsFmt}:${secsFmt}`;
}

export function formatTimeISO(seconds: number) {
    const { hrs, mins, secs } = decomposeTime(seconds);
    return `PT${hrs}H${mins}M${secs}S`;
}
