import { describe, expect, test } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import ImageGrid from "./ImageGrid.svelte";
import type { Image } from "$lib/types.svelte";

function makeImgList(length: number) {
    return Array.from({ length }, (_, i) => ({
        name: `image${i + 1}.jpg`,
        url: `https://localhost/image${i + 1}.jpg`,
    }));
}

function expectImagesVisible(imgs: Image[]) {
    for (const img of imgs) {
        const imgElement = screen.getByRole("img", {
            name: RegExp(`thumbnail for ${img.name}`, "i"),
        });
        expect(imgElement).toBeVisible();
        expect(imgElement).toHaveAttribute("src", img.url);
    }
}

function expectImagesNotVisible(imgs: Image[]) {
    for (const img of imgs) {
        const imgElement = screen.queryByRole("img", {
            name: RegExp(`thumbnail for ${img.name}`, "i"),
        });
        expect(imgElement).toBeNull();
    }
}

describe("ImageGrid.svelte", () => {
    test("imgs.length < maxImgs", () => {
        const imgs = makeImgList(5);
        render(ImageGrid, { maxImgs: 6, imgs });
        expectImagesVisible(imgs);
    });

    test("imgs.length == maxImgs", () => {
        const imgs = makeImgList(6);
        render(ImageGrid, { maxImgs: 6, imgs });
        expectImagesVisible(imgs);
    });

    test("imgs.length > maxImgs", () => {
        const imgs = makeImgList(8);
        render(ImageGrid, { maxImgs: 6, imgs });
        expectImagesVisible(imgs.slice(0, 5));
        expectImagesNotVisible(imgs.slice(5));
        expect(screen.getByText(/3/i)).toBeVisible();
    });

    test("Loading images", () => {
        const imgs = makeImgList(5);
        render(ImageGrid, { maxImgs: 6, imgs, isLoading: true });
        expectImagesNotVisible(imgs);
        screen.getAllByRole("progressbar", { name: /loading/i }).forEach((loading) => {
            expect(loading).toBeVisible();
        });
    });
});
