<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { DrawingSession } from "$lib/drawing-session.svelte";
    import SessionUI from "../routes/session/SessionUI.svelte";
    import Sample1 from "./assets/pexels-by-hong-son.jpg";
    import Sample2 from "./assets/pexels-by-sasha-kim.jpg";
    import Sample3 from "./assets/pexels-by-andrew-sindt.jpg";

    const { Story } = defineMeta({
        title: "SessionUI",
        component: SessionUI,
        tags: ["autodocs"],
    });

    const drawingSession = new DrawingSession(
        [{ url: Sample1 }, { url: Sample2 }, { url: Sample3 }],
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
