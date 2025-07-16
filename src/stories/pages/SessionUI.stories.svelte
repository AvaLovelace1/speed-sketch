<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { DrawingSession } from "$lib/drawing-session.svelte.js";
    import SessionUI from "../../routes/session/SessionUI.svelte";
    import Sample1 from "../assets/pexels-by-hong-son.jpg";
    import Sample2 from "../assets/pexels-by-sasha-kim.jpg";
    import Sample3 from "../assets/pexels-by-andrew-sindt.jpg";

    const { Story } = defineMeta({
        title: "Pages/SessionUI",
        component: SessionUI,
        tags: ["autodocs"],
    });

    const drawingSession = new DrawingSession(
        [
            { name: "img1", url: Sample1 },
            { name: "img2", url: Sample2 },
            { name: "img3", url: Sample3 },
        ],
        60,
    );
</script>

<!-- The main UI for the drawing session. -->
<Story
    name="SessionUI"
    args={{
        drawingSession,
        setAlwaysOnTop: async (_) => {},
        showImageFolder: async () => {},
        includeTooltipProvider: true,
    }}
/>
