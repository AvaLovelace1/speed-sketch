import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Toolbar from "./Toolbar.svelte";

describe("Toolbar.svelte", () => {
    test("toolbar buttons work", async () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        render(Toolbar, {
            tools: [
                { key: 1, tooltip: "Tool 1", icon: "1", action: handler1 },
                { key: 2, tooltip: "Tool 2", icon: "2", action: handler2 },
            ],
            includeTooltipProvider: true,
        });

        const tool1 = screen.getByRole("button", { name: "Tool 1" });
        const tool2 = screen.getByRole("button", { name: "Tool 2" });
        const user = userEvent.setup();
        await user.click(tool1);
        await user.click(tool2);
        await user.click(tool2);
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(2);
    });

    test("custom class is applied", () => {
        const handler1 = vi.fn();
        render(Toolbar, {
            tools: [
                { key: 1, tooltip: "Tool 1", icon: "1", action: handler1, class: "custom-class" },
            ],
            includeTooltipProvider: true,
        });

        expect(screen.getByRole("button", { name: "Tool 1" })).toHaveClass("custom-class");
    });

    test("hotkeys work", async () => {
        const handler1 = vi.fn();
        render(Toolbar, {
            tools: [{ key: 1, tooltip: "Tool 1", icon: "2", action: handler1, hotkey: "a" }],
            includeTooltipProvider: true,
        });

        const user = userEvent.setup();
        await user.keyboard("a");
        expect(handler1).toHaveBeenCalledTimes(1);
    });
});
