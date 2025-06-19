import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import FolderInput from "./FolderInput.svelte";
import RadioButtons from "./RadioButtons.svelte";

describe("FolderInput.svelte", () => {
    test("folder input renders", () => {
        const callback = vi.fn();
        render(FolderInput, { label: "Folder Input", callback: callback });
        const field = screen.getByRole("textbox", { name: /.*folder.*/i });
        const button = screen.getByRole("button", { name: /.*folder.*/i });

        expect(field).toBeVisible();
        expect(field).toBeRequired();
        expect(field).toHaveAttribute("readonly");
        expect(field).toHaveValue("");
        expect(button).toBeVisible();

        const user = userEvent.setup();
        user.click(button);
    });
    test("folder input renders info messages", () => {
        render(FolderInput, {
            label: "Folder Input",
            errorMsg: "Error message",
            infoMsg: "Info message",
        });
        const error = screen.getByRole("alert", { name: /.*error.*/i });
        const info = screen.getByRole("status", { name: /.*info.*/i });

        expect(error).toHaveTextContent("Error message");
        expect(info).toHaveTextContent("Info message");
    });
});

describe("RadioButtons.svelte", () => {
    test("should render radio buttons", () => {
        render(RadioButtons, {
            groupLabel: "RadioButtons",
            options: [{ label: "Option 1" }, { label: "Option 2", value: "two" }],
            group: "",
        });
        const button1 = screen.getByRole("radio", { name: "Option 1" });
        const button2 = screen.getByRole("radio", { name: "Option 2" });

        expect(button1).toBeVisible();
        expect(button2).toBeVisible();
    });
});
