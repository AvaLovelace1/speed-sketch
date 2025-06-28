import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Timer from "$lib/components/Timer.svelte";

describe("Timer.svelte", () => {
    test.each([
        [0, "0:00", "0ms"],
        [3600, "1:00:00", "1h"],
        [-3610, "-1:00:10", "-1h 10s"],
    ])("timeRemaining %i", (timeRemaining, clocktime, datetime) => {
        render(Timer, { time: timeRemaining });
        const timeElement = screen.getByRole("time");
        expect(timeElement).toHaveTextContent(clocktime);
        expect(timeElement).toHaveAttribute("datetime", datetime);
    });

    test("custom class is applied", () => {
        render(Timer, { time: 10, class: "custom-class" });
        expect(screen.getByRole("timer")).toHaveClass("custom-class");
    });

    test("radial progress is correct", () => {
        render(Timer, { time: 30, maxTime: 120 });
        expect(screen.getByRole("progressbar")).toHaveValue(75);
    });
});
