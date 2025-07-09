<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import EndScreenUI from "../routes/session/end/EndScreenUI.svelte";

    const { Story } = defineMeta({
        title: "EndScreenUI",
        component: EndScreenUI,
        tags: ["autodocs"],
    });
</script>

<!-- The screen displayed at the end of a session. -->
<Story
    name="EndScreenUI"
    args={{
        nCompletedImgs: 42,
        timeSpent: 60 ** 2 + 30 * 60 + 15,
        includeTooltipProvider: true,
    }}
/>
