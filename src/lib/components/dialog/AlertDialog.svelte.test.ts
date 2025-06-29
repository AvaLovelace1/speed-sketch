import { describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/svelte";
import AlertDialog from "./AlertDialog.svelte";

interface AlertDialogFixture {
    fixture: {
        alertDialog: AlertDialog;
        user: UserEvent;
        onOpen: () => void;
        onCancel: () => void;
        onConfirm: () => void;
    };
}

const testAlertDialog = test.extend<AlertDialogFixture>({
    fixture: async ({ task: _task }, use) => {
        // Mock Svelte transitions to avoid "animate is not a function" errors during testing
        vi.mock("svelte/transition");
        vi.mock("svelte-reduced-motion/transition");

        const onOpen = vi.fn();
        const onCancel = vi.fn();
        const onConfirm = vi.fn();
        const renderResult = render(AlertDialog, {
            title: "Test Alert",
            description: "Test Description",
            cancelText: "Cancel",
            confirmText: "Confirm",
            onOpen,
            onCancel,
            onConfirm,
        });
        const user = userEvent.setup();
        await use({ alertDialog: renderResult.component, user, onOpen, onCancel, onConfirm });

        vi.restoreAllMocks();
    },
});

describe("AlertDialog.svelte", () => {
    testAlertDialog(
        "dialog opens",
        async ({ fixture: { alertDialog, onOpen, onCancel, onConfirm } }) => {
            alertDialog.open();
            expect(await screen.findByRole("alertdialog")).toBeVisible();
            expect(screen.getByRole("heading", { name: "Test Alert" })).toBeVisible();
            expect(screen.getByText("Test Description")).toBeVisible();

            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onCancel).toHaveBeenCalledTimes(0);
            expect(onConfirm).toHaveBeenCalledTimes(0);
        },
    );

    testAlertDialog.for([
        {
            name: "X button",
            action: async (user: UserEvent) =>
                await user.click(screen.getByRole("button", { name: "Close" })),
        },
        {
            name: "cancel button",
            action: async (user: UserEvent) =>
                await user.click(screen.getByRole("button", { name: "Cancel" })),
        },
        {
            name: "escape key",
            action: async (user: UserEvent) => await user.keyboard("{Escape}"),
        },
    ])(
        "cancel actions work",
        async ({ action }, { fixture: { alertDialog, user, onOpen, onConfirm } }) => {
            alertDialog.open();
            expect(await screen.findByRole("alertdialog")).toBeVisible();
            await action(user);
            expect(screen.queryByRole("alertdialog")).toBeNull();

            expect(onOpen).toHaveBeenCalledTimes(1);
            // doesn't work in Vitest environment due to animations being mocked
            // expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onConfirm).toHaveBeenCalledTimes(0);
        },
    );

    testAlertDialog(
        "confirm action works",
        async ({ fixture: { alertDialog, user, onOpen, onCancel, onConfirm } }) => {
            alertDialog.open();
            expect(await screen.findByRole("alertdialog")).toBeVisible();
            await user.click(screen.getByRole("button", { name: "Confirm" }));

            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onCancel).toHaveBeenCalledTimes(0);
            expect(onConfirm).toHaveBeenCalledTimes(1);
        },
    );
});
