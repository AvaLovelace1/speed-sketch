import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import Page from "./+page.svelte";

describe("routes/+page.svelte", () => {
    test("page renders", () => {
        render(Page);
    });
});
