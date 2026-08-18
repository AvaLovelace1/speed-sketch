import { describe, expect, test as base } from "vitest";
import { ListManager } from "./list-manager.svelte";

const test = base
    .extend("items", ({ task: _task }) => ["a", "b", "c"])
    .extend("manager", ({ items }) => new ListManager(items));

describe("list-manager.svelte.ts", () => {
    describe("constructor", () => {
        test("selects first item when non-empty", ({ manager }) => {
            expect(manager.selectedIdx).toBe(0);
        });

        test("selects -1 when empty", () => {
            const manager = new ListManager([]);
            expect(manager.selectedIdx).toBe(-1);
        });
    });

    describe("selectedIdx setter", () => {
        test.for([-1, 0, 1, 2])("allows in-range value %d", (idx, { manager }) => {
            manager.selectedIdx = idx;
            expect(manager.selectedIdx).toBe(idx);
        });

        test.for([-2, 3])("rejects out-of-range value %d", (idx, { manager }) => {
            expect(() => (manager.selectedIdx = idx)).toThrow("out of range");
        });
    });

    describe("addItem", () => {
        test("adds item to empty list and selects it, in-place", () => {
            const items: string[] = [];
            const manager = new ListManager<string>(items);
            manager.addItem("a");
            expect(items).toEqual(["a"]);
            expect(manager.selectedIdx).toBe(0);
        });

        test.for([
            { idx: -1, expectedItems: ["x", "a", "b", "c"] },
            { idx: 0, expectedItems: ["a", "x", "b", "c"] },
            { idx: 2, expectedItems: ["a", "b", "c", "x"] },
        ])(
            "adds item after idx $idx and selects it, in-place",
            ({ idx, expectedItems }, { items, manager }) => {
                manager.selectedIdx = idx;
                manager.addItem("x");
                expect(items).toEqual(expectedItems);
                expect(manager.selectedIdx).toBe(idx + 1);
            },
        );
    });

    describe("removeItem", () => {
        test("removes only item from list and sets idx to -1, in-place", () => {
            const items = ["a"];
            const manager = new ListManager<string>(items);
            manager.removeItem();
            expect(items).toEqual([]);
            expect(manager.selectedIdx).toBe(-1);
        });

        test.for([
            { idx: 0, expectedItems: ["b", "c"], expectedIdx: 0 },
            { idx: 1, expectedItems: ["a", "c"], expectedIdx: 1 },
            { idx: 2, expectedItems: ["a", "b"], expectedIdx: 1 },
        ])(
            "removes selected item $idx and clamps idx, in-place",
            ({ idx, expectedItems, expectedIdx }, { items, manager }) => {
                manager.selectedIdx = idx;
                manager.removeItem();
                expect(items).toEqual(expectedItems);
                expect(manager.selectedIdx).toBe(expectedIdx);
            },
        );

        test("is no-op when nothing is selected", ({ manager }) => {
            manager.selectedIdx = -1;
            manager.removeItem();
            expect(manager.items).toEqual(["a", "b", "c"]);
            expect(manager.selectedIdx).toBe(-1);
        });
    });

    describe("moveItemUp", () => {
        test.for([
            { idx: 1, expectedItems: ["b", "a", "c"] },
            { idx: 2, expectedItems: ["a", "c", "b"] },
        ])(
            "swaps selected item $idx with previous and updates selection, in-place",
            ({ idx, expectedItems }, { items, manager }) => {
                manager.selectedIdx = idx;
                manager.moveItemUp();
                expect(items).toEqual(expectedItems);
                expect(manager.selectedIdx).toBe(idx - 1);
            },
        );

        test.for([-1, 0])("is no-op if idx %d is selected", (idx, { manager }) => {
            manager.selectedIdx = idx;
            manager.moveItemUp();
            expect(manager.items).toEqual(["a", "b", "c"]);
            expect(manager.selectedIdx).toBe(idx);
        });
    });

    describe("moveItemDown", () => {
        test.for([
            { idx: 0, expectedItems: ["b", "a", "c"] },
            { idx: 1, expectedItems: ["a", "c", "b"] },
        ])(
            "swaps selected item $idx with next and updates selection, in-place",
            ({ idx, expectedItems }, { items, manager }) => {
                manager.selectedIdx = idx;
                manager.moveItemDown();
                expect(items).toEqual(expectedItems);
                expect(manager.selectedIdx).toBe(idx + 1);
            },
        );

        test.for([-1, 2])("is no-op if idx %d is selected", (idx, { manager }) => {
            manager.selectedIdx = idx;
            manager.moveItemDown();
            expect(manager.items).toEqual(["a", "b", "c"]);
            expect(manager.selectedIdx).toBe(idx);
        });
    });

    describe("moveItem", () => {
        test.for([
            { idx: 0, targetIdx: 0, expectedItems: ["a", "b", "c"] },
            { idx: 0, targetIdx: 1, expectedItems: ["b", "a", "c"] },
            { idx: 1, targetIdx: 2, expectedItems: ["a", "c", "b"] },
            { idx: 2, targetIdx: 0, expectedItems: ["c", "a", "b"] },
            { idx: 0, targetIdx: 2, expectedItems: ["b", "c", "a"] },
        ])(
            "moves selected item $idx to idx $targetIdx and updates selection, in-place",
            ({ idx, targetIdx, expectedItems }, { items, manager }) => {
                manager.selectedIdx = idx;
                manager.moveItem(targetIdx);
                expect(items).toEqual(expectedItems);
                expect(manager.selectedIdx).toBe(targetIdx);
            },
        );

        test("works on one-item list", () => {
            const items = ["a"];
            const manager = new ListManager<string>(items);
            manager.moveItem(0);
            expect(items).toEqual(["a"]);
            expect(manager.selectedIdx).toBe(0);
        });

        test("is no-op when nothing is selected", ({ manager }) => {
            manager.selectedIdx = -1;
            manager.moveItem(1);
            expect(manager.items).toEqual(["a", "b", "c"]);
            expect(manager.selectedIdx).toBe(-1);
        });

        test.for([-1, 3])("rejects out-of-range idx %d", (idx, { manager }) => {
            manager.selectedIdx = 0;
            expect(() => manager.moveItem(idx)).toThrow("out of range");
        });
    });
});
