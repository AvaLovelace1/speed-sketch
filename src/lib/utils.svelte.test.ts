import { describe, test, expect } from "vitest";
import { isVideoFile } from "./utils.svelte";

describe("utils.svelte.ts", () => {
    test.for([
        "movie.mp4",
        "clip.webm",
        "scene.mov",
        "rec.mkv",
        "old.avi",
        "phone.m4v",
        "free.ogv",
        "/path/to/Some.MP4",
    ])("isVideoFile returns true for %s", (name) => {
        expect(isVideoFile(name)).toBe(true);
    });

    test.for(["photo.jpg", "photo.jpeg", "photo.PNG", "doc.txt", "no-extension", ""])(
        "isVideoFile returns false for %s",
        (name) => {
            expect(isVideoFile(name)).toBe(false);
        },
    );
});
