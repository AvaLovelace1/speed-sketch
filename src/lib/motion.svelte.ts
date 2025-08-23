import {
    fade as svelteFade,
    scale as svelteScale,
    slide as svelteSlide,
    fly as svelteFly,
} from "svelte/transition";
import { prefersReducedMotion } from "svelte/motion";
import { cubicOut } from "svelte/easing";

type Duration = "short" | "medium" | "long";
const DURATIONS = new Map<Duration, number>([
    ["short", 100],
    ["medium", 200],
    ["long", 300],
]);
const EASING = cubicOut;

export function getDuration(duration: Duration) {
    if (!DURATIONS.has(duration)) throw new Error(`Invalid duration: ${duration}`);
    return DURATIONS.get(duration) as number;
}

export function fade(node: Element, { duration }: { duration: Duration }) {
    return svelteFade(node, {
        duration: DURATIONS.get(duration),
        easing: EASING,
    });
}

export function scale(node: Element, { duration }: { duration: Duration }) {
    return svelteScale(node, {
        start: prefersReducedMotion.current ? 1 : 0.95,
        duration: DURATIONS.get(duration),
        easing: EASING,
    });
}

export function slide(node: Element, { duration }: { duration: Duration }) {
    return svelteSlide(node, {
        duration: prefersReducedMotion.current ? 0 : DURATIONS.get(duration),
        easing: EASING,
    });
}

export function fly(
    node: Element,
    { x = 0, y = 0, duration }: { x?: number; y?: number; duration: Duration },
) {
    return svelteFly(node, {
        x: prefersReducedMotion.current ? 0 : x,
        y: prefersReducedMotion.current ? 0 : y,
        duration: DURATIONS.get(duration),
        easing: EASING,
    });
}
