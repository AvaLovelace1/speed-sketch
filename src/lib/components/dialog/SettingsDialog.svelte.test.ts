import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import SettingsDialog from "$lib/components/dialog/SettingsDialog.svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";

interface SettingsDialogFixture {
    fixture: {
        settingsDialog: SettingsDialog;
        user: UserEvent;
    };
}

const testSettingsDialog = test.extend<SettingsDialogFixture>({
    fixture: async ({ task: _task }, use) => {
        // Mock Svelte transitions to avoid "animate is not a function" errors during testing
        vi.mock("svelte/transition");
        vi.mock("svelte-reduced-motion/transition");

        const renderResult = render(SettingsDialog, {});
        const user = userEvent.setup();
        await use({ settingsDialog: renderResult.component, user });

        vi.restoreAllMocks();
    },
});

describe("SettingsDialog.svelte", () => {
    testSettingsDialog("SettingsDialog renders", async ({ fixture: { settingsDialog } }) => {
        settingsDialog.open();
        expect(await screen.findByRole("dialog")).toBeVisible();
        expect(screen.getByRole("heading", { name: "Settings" })).toBeVisible();
    });
});
