import { describe, expect, test } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import Page from "./+page.svelte";

const IMGS = [
    { name: "image1.jpg", url: "https://localhost/image1.jpg" },
    { name: "image2.jpg", url: "https://localhost/image2.jpg" },
    { name: "image3.jpg", url: "https://localhost/image3.jpg" },
];

describe("routes/+page.svelte", () => {
    test("page renders", async () => {
        const renderResult = render(Page);
        const page = renderResult.component;

        // Button should be disabled initially
        const goButton = screen.getByRole("button", { name: /go/i });
        expect(goButton).toBeDisabled();

        // Simulate inputting images
        await page.onImagesInput(IMGS);
        expect(goButton).toBeEnabled();

        // Simulate inputting empty folder
        await page.onImagesInput([]);
        expect(goButton).toBeDisabled();

        // Input images again
        await page.onImagesInput(IMGS);
        expect(goButton).toBeEnabled();
    });
});
