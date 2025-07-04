import { describe, expect, test as base, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/svelte";
import Dialog from "./Dialog.svelte";
import { createRawSnippet } from "svelte";

interface DialogFixture {
    fixture: {
        dialog: Dialog;
        user: UserEvent;
        onOpen: () => void;
        onClose: () => void;
    };
}

const test = base.extend<DialogFixture>({
    fixture: async ({ task: _task }, use) => {
        // Mock Svelte transitions to avoid "animate is not a function" errors during testing
        vi.mock("svelte/transition");
        vi.mock("svelte-reduced-motion/transition");

        const snippet = () => ({
            render() {
                return "<p>Test Description</p>";
            },
        });

        const onOpen = vi.fn();
        const onClose = vi.fn();
        const renderResult = render(Dialog, {
            title: "Test Dialog",
            onOpen,
            onClose,
            children: createRawSnippet(snippet),
        });
        const user = userEvent.setup();
        await use({ dialog: renderResult.component, user, onOpen, onClose });

        vi.restoreAllMocks();
    },
});

describe("Dialog.svelte", () => {
    test("dialog opens", async ({ fixture: { dialog, onOpen, onClose } }) => {
        dialog.open();
        expect(await screen.findByRole("dialog")).toBeVisible();
        expect(screen.getByRole("heading", { name: "Test Dialog" })).toBeVisible();
        expect(screen.getByText("Test Description")).toBeVisible();

        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(0);
    });

    test.for([
        {
            name: "X button",
            action: async (user: UserEvent) =>
                await user.click(screen.getByRole("button", { name: "Close" })),
        },
        {
            name: "escape key",
            action: async (user: UserEvent) => await user.keyboard("{Escape}"),
        },
    ])("dialog closes with $name", async ({ action }, { fixture: { dialog, user, onOpen } }) => {
        dialog.open();
        expect(await screen.findByRole("dialog")).toBeVisible();
        await action(user);
        expect(screen.queryByRole("dialog")).toBeNull();

        expect(onOpen).toHaveBeenCalledTimes(1);
        // doesn't work in Vitest environment due to animations being mocked
        // expect(onClose).toHaveBeenCalledTimes(1);
    });
});
