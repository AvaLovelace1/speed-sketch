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

// A name that does not clash with `existingNames`, numbering it if it would:
// "Warmup" becomes "Warmup (2)" when "Warmup" is taken.
export function uniqueName(existingNames: string[], name: string): string {
    const taken = new Set(existingNames);
    if (!taken.has(name)) return name;
    for (let n = 2; ; n++) {
        const candidate = `${name} (${n})`;
        if (!taken.has(candidate)) return candidate;
    }
}

// Count with its noun, e.g. plural(1, "day") === "1 day" and plural(2, "day") === "2 days".
export function formatPlural(count: number, singular: string, pluralForm = `${singular}s`): string {
    return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function formatDuration(seconds: number): string {
    return seconds === 0 ? "0s" : prettyMilliseconds(seconds * 1000, { unitCount: 2 });
}
