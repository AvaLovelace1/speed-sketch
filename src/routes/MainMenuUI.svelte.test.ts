import { describe, expect, test as base, vi, type Mock } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import MainMenuUI from "./MainMenuUI.svelte";
import { isTauri } from "@tauri-apps/api/core";

const test = base.extend({
    fixture: async ({ task: _task }, use) => {
        vi.mock("svelte/transition");
        vi.mock("svelte-reduced-motion/transition");
        vi.mock("@tauri-apps/api/core", async () => {
            const originalModule = await vi.importActual("@tauri-apps/api/core");
            return {
                ...originalModule,
                isTauri: vi.fn().mockReturnValue(false),
            };
        });

        await use({});
        vi.restoreAllMocks();
    },
});

describe("MainMenuUI.svelte", () => {
    test("UI renders", async () => {
        const startSession = vi.fn();
        render(MainMenuUI, { canStartSession: true, imgErrMsg: "", startSession });

        // Check that title and footer are visible
        expect(screen.getByRole("heading")).toBeVisible();
        expect(screen.getByRole("contentinfo")).toBeVisible();

        // Check that there is no error message
        expect(screen.queryByRole("status", { name: /error/i })).toBeNull();

        // Check that dropzone is visible
        expect(screen.getByRole("button", { name: /drag & drop/i })).toBeVisible();

        // Check that "shuffle" checkbox is visible
        expect(screen.getByRole("checkbox", { name: /shuffle/i })).toBeEnabled();

        // Check that "include subfolders" checkbox is NOT visible (only visible in Tauri env)
        expect(screen.queryByRole("checkbox", { name: /include subfolders/i })).toBeNull();

        // Check that settings button is visible
        expect(screen.getByRole("button", { name: /settings/i })).toBeVisible();

        const user = userEvent.setup();

        // Select time of 1m
        await user.click(screen.getByRole("radio", { name: /1m/i }));
        expect(screen.queryByRole("spinbutton", { name: /minute, custom time/i })).toBeNull();

        // Select custom time
        await user.click(screen.getByRole("radio", { name: /custom/i }));
        expect(screen.getByRole("spinbutton", { name: /minute, custom time/i })).toBeVisible();

        // Click GO button
        await user.click(screen.getByRole("button", { name: /go/i }));
        expect(startSession).toHaveBeenCalledTimes(1);
    });

    test("include subfolders checkbox visible with Tauri", async () => {
        (isTauri as Mock).mockReturnValue(true);
        render(MainMenuUI, {});
        // Check that "include subfolders" checkbox is visible
        expect(screen.getByRole("checkbox", { name: /include subfolders/i })).toBeVisible();
    });

    test("disabled GO button when canStartSession=false", () => {
        render(MainMenuUI, { canStartSession: false });
        expect(screen.getByRole("button", { name: /go/i })).toBeDisabled();
    });

    test("error message visible when imgErrMsg is set", () => {
        const imgErrMsg = "Test error message";
        render(MainMenuUI, { imgErrMsg });
        expect(screen.getByRole("status", { name: /error/i })).toHaveTextContent(imgErrMsg);
    });
});
