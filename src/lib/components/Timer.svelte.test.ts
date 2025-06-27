import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Timer from "$lib/components/Timer.svelte";

describe("Timer.svelte", () => {
    test("timeRemaining 0", async () => {
        render(Timer, { time: 0 });
        const timeElement = screen.getByRole("time");
        expect(timeElement).toHaveTextContent(/^0:00$/);
        expect(timeElement).toHaveAttribute("datetime", "0ms");
    });
    test("timeRemaining 3600", async () => {
        render(Timer, { time: 3600 });
        const timeElement = screen.getByRole("time");
        expect(timeElement).toHaveTextContent(/^1:00:00$/);
        expect(timeElement).toHaveAttribute("datetime", "1h");
    });
    test("timeRemaining -3610", async () => {
        render(Timer, { time: -3610 });
        const timeElement = screen.getByRole("time");
        expect(timeElement).toHaveAttribute("datetime", "-1h 10s");
    });
    test("custom class is applied", async () => {
        render(Timer, { time: 10, class: "custom-class" });
        expect(screen.getByRole("timer")).toHaveClass("custom-class");
    });
    test("radial progress is correct", async () => {
        render(Timer, { time: 30, maxTime: 120 });
        expect(screen.getByRole("progressbar")).toHaveValue(75);
    });
});
