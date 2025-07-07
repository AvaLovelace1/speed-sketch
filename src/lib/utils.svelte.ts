export function validateString(value: unknown, allowedValues: string[]): value is string {
    return typeof value === "string" && allowedValues.includes(value);
}

export function validateNumber(value: unknown, min: number, max: number): value is number {
    return typeof value === "number" && value >= min && value <= max;
}

export function validateInteger(value: unknown, min: number, max: number): value is number {
    return Number.isInteger(value) && validateNumber(value, min, max);
}

// Shuffle an array in place
export function fisherYatesShuffle(array: unknown[]) {
    for (let curIdx = array.length - 1; curIdx >= 1; curIdx--) {
        const randomIdx = Math.floor(Math.random() * (curIdx + 1));
        [array[curIdx], array[randomIdx]] = [array[randomIdx], array[curIdx]];
    }
}

export function basename(path: string) {
    const lastSlashIndex = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
    return path.substring(lastSlashIndex + 1);
}
