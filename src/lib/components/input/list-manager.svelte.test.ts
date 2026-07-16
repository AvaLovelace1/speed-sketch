import { describe, expect, test } from "vitest";
import { ListManager } from "./list-manager.svelte";

describe("list-manager.svelte.ts", () => {
    test("constructor selects first item when non-empty", () => {
        const manager = new ListManager(["a", "b", "c"]);
        expect(manager.selectedIdx).toBe(0);
    });

    test("constructor selects -1 when empty", () => {
        const manager = new ListManager([]);
        expect(manager.selectedIdx).toBe(-1);
    });

    test("selectedIdx setter rejects out-of-range values", () => {
        const manager = new ListManager(["a", "b"]);
        expect(() => (manager.selectedIdx = -2)).toThrow("out of range");
        expect(() => (manager.selectedIdx = 2)).toThrow("out of range");
    });

    test("selectedIdx setter allows -1", () => {
        const manager = new ListManager(["a"]);
        manager.selectedIdx = -1;
        expect(manager.selectedIdx).toBe(-1);
    });

    test("addItem inserts after selected and advances selection", () => {
        const manager = new ListManager<string>([]);

        // Add to empty list (selectedIdx is -1, so inserts at 0)
        manager.addItem("a");
        expect(manager.items).toEqual(["a"]);
        expect(manager.selectedIdx).toBe(0);

        // Add after selected (end)
        manager.addItem("b");
        expect(manager.items).toEqual(["a", "b"]);
        expect(manager.selectedIdx).toBe(1);

        // Add after first item
        manager.selectedIdx = 0;
        manager.addItem("c");
        expect(manager.items).toEqual(["a", "c", "b"]);
        expect(manager.selectedIdx).toBe(1);
    });

    test("removeItem removes selected and clamps index", () => {
        const manager = new ListManager(["a", "b", "c"]);

        // Remove middle
        manager.selectedIdx = 1;
        manager.removeItem();
        expect(manager.items).toEqual(["a", "c"]);
        expect(manager.selectedIdx).toBe(1);

        // Remove last
        manager.removeItem();
        expect(manager.items).toEqual(["a"]);
        expect(manager.selectedIdx).toBe(0);

        // Remove only item
        manager.removeItem();
        expect(manager.items).toEqual([]);
        expect(manager.selectedIdx).toBe(-1);
    });

    test("removeItem is a no-op when nothing is selected", () => {
        const manager = new ListManager(["a", "b"]);
        manager.selectedIdx = -1;
        manager.removeItem();
        expect(manager.items).toEqual(["a", "b"]);
        expect(manager.selectedIdx).toBe(-1);
    });

    test("moveItemUp swaps with previous and updates selection", () => {
        const manager = new ListManager(["a", "b", "c"]);

        manager.selectedIdx = 2;
        manager.moveItemUp();
        expect(manager.items).toEqual(["a", "c", "b"]);
        expect(manager.selectedIdx).toBe(1);

        manager.moveItemUp();
        expect(manager.items).toEqual(["c", "a", "b"]);
        expect(manager.selectedIdx).toBe(0);
    });

    test("moveItemUp is a no-op at index 0", () => {
        const manager = new ListManager(["a", "b"]);

        manager.selectedIdx = 0;
        manager.moveItemUp();
        expect(manager.items).toEqual(["a", "b"]);
        expect(manager.selectedIdx).toBe(0);
    });

    test("moveItemDown swaps with next and updates selection", () => {
        const manager = new ListManager(["a", "b", "c"]);

        manager.selectedIdx = 0;
        manager.moveItemDown();
        expect(manager.items).toEqual(["b", "a", "c"]);
        expect(manager.selectedIdx).toBe(1);

        manager.moveItemDown();
        expect(manager.items).toEqual(["b", "c", "a"]);
        expect(manager.selectedIdx).toBe(2);
    });

    test("moveItemDown is a no-op at last index", () => {
        const manager = new ListManager(["a", "b"]);

        manager.selectedIdx = 1;
        manager.moveItemDown();
        expect(manager.items).toEqual(["a", "b"]);
        expect(manager.selectedIdx).toBe(1);
    });

    test("moveItemUp and moveItemDown are no-ops when nothing is selected", () => {
        const manager = new ListManager(["a", "b"]);
        manager.selectedIdx = -1;
        manager.moveItemUp();
        expect(manager.items).toEqual(["a", "b"]);
        expect(manager.selectedIdx).toBe(-1);
        manager.moveItemDown();
        expect(manager.items).toEqual(["a", "b"]);
        expect(manager.selectedIdx).toBe(-1);
    });

    test("moveItem moves selected item to arbitrary index", () => {
        const manager = new ListManager(["a", "b", "c"]);

        // Move last to first
        manager.selectedIdx = 2;
        manager.moveItem(0);
        expect(manager.items).toEqual(["c", "a", "b"]);
        expect(manager.selectedIdx).toBe(0);

        // Move first to middle
        manager.moveItem(1);
        expect(manager.items).toEqual(["a", "c", "b"]);
        expect(manager.selectedIdx).toBe(1);

        // Move middle to last
        manager.moveItem(2);
        expect(manager.items).toEqual(["a", "b", "c"]);
        expect(manager.selectedIdx).toBe(2);
    });

    test("moveItem rejects out-of-range index", () => {
        const manager = new ListManager(["a", "b"]);
        manager.selectedIdx = 0;
        expect(() => manager.moveItem(-1)).toThrow("out of range");
        expect(() => manager.moveItem(2)).toThrow("out of range");
    });

    test("moveItem is a no-op when nothing is selected", () => {
        const manager = new ListManager(["a", "b"]);
        manager.selectedIdx = -1;
        manager.moveItem(1);
        expect(manager.items).toEqual(["a", "b"]);
        expect(manager.selectedIdx).toBe(-1);
    });

    test("items array is mutated in place", () => {
        const arr = ["a", "b"];
        const manager = new ListManager(arr);
        manager.addItem("c");
        expect(arr).toEqual(["a", "c", "b"]);
    });
});
