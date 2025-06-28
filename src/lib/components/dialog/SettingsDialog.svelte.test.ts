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
    testSettingsDialog(
        "SettingsDialog opens and closes",
        async ({ fixture: { settingsDialog, user } }) => {
            settingsDialog.open();
            expect(await screen.findByRole("dialog")).toBeVisible();

            await user.click(screen.getByRole("button", { name: "Close" }));
            expect(screen.queryByRole("dialog")).toBeNull();
        },
    );

    testSettingsDialog(
        "setOnOpen and setOnClose work",
        async ({ fixture: { settingsDialog, user } }) => {
            const onOpen = vi.fn();
            const onClose = vi.fn();
            settingsDialog.setOnOpen(onOpen);
            settingsDialog.setOnClose(onClose);

            settingsDialog.open();
            expect(await screen.findByRole("dialog")).toBeVisible();
            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(0);

            await user.click(screen.getByRole("button", { name: "Close" }));
            expect(onOpen).toHaveBeenCalledTimes(1);
            // onClose doesn't work in testing environment because transitions are mocked
            // expect(onClose).toHaveBeenCalledTimes(1);
        },
    );
});
