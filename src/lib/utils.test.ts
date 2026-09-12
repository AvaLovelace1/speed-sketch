import { describe, test, expect } from "vitest";
import { isVideoFile, formatPlural, uniqueName } from "./utils";

describe("utils.ts", () => {
    describe("isVideoFile", () => {
        test.for([
            "movie.mp4",
            "clip.webm",
            "scene.mov",
            "rec.mkv",
            "old.avi",
            "phone.m4v",
            "free.ogv",
            "/path/to/Some.MP4",
        ])("returns true for %s", (name) => {
            expect(isVideoFile(name)).toBe(true);
        });

        test.for(["photo.jpg", "photo.jpeg", "photo.PNG", "doc.txt", "no-extension", ""])(
            "returns false for %s",
            (name) => {
                expect(isVideoFile(name)).toBe(false);
            },
        );
    });

    describe("uniqueName", () => {
        test("keeps a name that is not taken", () => {
            expect(uniqueName(["Long Poses"], "Warmup")).toBe("Warmup");
        });

        test("keeps a name when nothing is taken", () => {
            expect(uniqueName([], "Warmup")).toBe("Warmup");
        });

        test("numbers a name that collides", () => {
            expect(uniqueName(["Warmup"], "Warmup")).toBe("Warmup (2)");
        });

        test("keeps counting past names already numbered", () => {
            expect(uniqueName(["Warmup", "Warmup (2)", "Warmup (4)"], "Warmup")).toBe("Warmup (3)");
        });
    });

    describe("formatPlural", () => {
        test.for([
            { count: 0, expected: "0 days" },
            { count: 1, expected: "1 day" },
            { count: 2, expected: "2 days" },
        ])("$count -> $expected", ({ count, expected }) => {
            expect(formatPlural(count, "day")).toBe(expected);
        });

        test("takes an irregular plural", () => {
            expect(formatPlural(2, "entry", "entries")).toBe("2 entries");
        });
    });
});
