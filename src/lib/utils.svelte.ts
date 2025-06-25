export function validateString(value: unknown, allowedValues: string[]) {
    return typeof value === "string" && allowedValues.includes(value);
}

export function validateNumber(value: unknown, min: number, max: number) {
    return typeof value === "number" && value >= min && value <= max;
}

export function validateInteger(value: unknown, min: number, max: number) {
    return Number.isInteger(value) && validateNumber(value, min, max);
}
