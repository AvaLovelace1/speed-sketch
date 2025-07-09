import { describe, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import EndScreenUI from "./EndScreenUI.svelte";

describe("EndScreenUI.svelte", () => {
    test("end screen renders with correct stats", () => {
        const nCompletedImgs = 42;
        const timeSpent = 125; // in seconds

        render(EndScreenUI, { nCompletedImgs, timeSpent, includeTooltipProvider: true });
        expect(screen.getByText(nCompletedImgs)).toBeVisible();
        expect(screen.getByText("2m 5s")).toBeVisible();
    });
});
