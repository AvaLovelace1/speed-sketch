<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Timer from "./Timer.svelte";

    const { Story } = defineMeta({
        title: "Components/Timer",
        component: Timer,
        tags: ["autodocs"],
    });
</script>

<!-- Displays a given time in a StatusAlert with a radial progress bar. -->
<Story name="Default" args={{ time: 30, maxTime: 30 }} />

<!-- Timer turns red when time is ≤ criticalTime. -->
<Story name="Critical Time" args={{ time: 5, criticalTime: 10, maxTime: 30 }} />
