import prettyMilliseconds from "pretty-ms";

// Shuffle an array in place
export function fisherYatesShuffle(array: unknown[]) {
    for (let curIdx = array.length - 1; curIdx >= 1; curIdx--) {
        const randomIdx = Math.floor(Math.random() * (curIdx + 1));
        [array[curIdx], array[randomIdx]] = [array[randomIdx], array[curIdx]];
    }
}

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "mkv", "avi", "m4v", "ogv"]);

export function isVideoFile(path: string): boolean {
    const dotIdx = path.lastIndexOf(".");
    if (dotIdx < 0) return false;
    const ext = path.substring(dotIdx + 1).toLowerCase();
    return VIDEO_EXTENSIONS.has(ext);
}

export function basename(path: string) {
    const lastSlashIndex = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
    return path.substring(lastSlashIndex + 1);
}

// Convert a string to a valid HTML id
export function stringToId(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function formatDuration(seconds: number): string {
    return seconds === 0 ? "0s" : prettyMilliseconds(seconds * 1000, { unitCount: 2 });
}
