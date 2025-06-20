<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import SessionUI from "./SessionUI.svelte";
    import Sample1 from "./assets/pexels-by-hong-son.jpg";

    const { Story } = defineMeta({
        title: "SessionUI",
        component: SessionUI,
        tags: ["autodocs"],
    });
</script>

<!-- The main UI for the drawing session. -->
<Story name="SessionUI" args={{ curImg: Sample1 }} />
