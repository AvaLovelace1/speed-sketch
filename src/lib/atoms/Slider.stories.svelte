<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Slider from "./Slider.svelte";

    const { Story } = defineMeta({
        title: "Atoms/Slider",
        component: Slider,
        tags: ["autodocs"],
        args: {
            label: "Slider",
            icon: "lucide--heart",
        },
    });
</script>

<!-- A basic slider. -->
<Story name="Default" />
