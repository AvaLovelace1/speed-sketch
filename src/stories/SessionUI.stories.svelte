<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { DrawingSession } from "$lib/drawing-session.svelte";
    import SessionUI from "../routes/session/SessionUI.svelte";
    import Sample1 from "./assets/pexels-by-hong-son.jpg";

    const { Story } = defineMeta({
        title: "SessionUI",
        component: SessionUI,
        tags: ["autodocs"],
    });

    const drawingSession = new DrawingSession([{ url: Sample1 }], 60);
</script>

<!-- The main UI for the drawing session. -->
<Story name="SessionUI" args={{ drawingSession, includeTooltipProvider: true }} />
