<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Colors from "./Colors.svelte";

    const { Story } = defineMeta({
        title: "Colors",
        component: Colors,
        tags: ["autodocs"],
    });
</script>

<!-- All theme colors used in the app. -->
<Story name="Colors" />
