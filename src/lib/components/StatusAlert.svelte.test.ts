import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import StatusAlert from "./StatusAlert.svelte";
import { createRawSnippet } from "svelte";

describe("StatusAlert.svelte", () => {
    test("alert renders", () => {
        const snippet = () => ({
            render() {
                return "<span>Test Alert</span>";
            },
        });

        render(StatusAlert, { children: createRawSnippet(snippet), class: "custom-class" });
        const alert = screen.getByRole("status");
        expect(alert).toHaveTextContent("Test Alert");
        expect(alert).toHaveClass("custom-class");
    });
});
