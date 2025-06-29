import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import RadioButtons from "./RadioButtons.svelte";

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
