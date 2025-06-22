<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Colors from "./Colors.svelte";

    const { Story } = defineMeta({
        title: "Colors",
        component: Colors,
        tags: ["autodocs"],
    });
</script>

<!-- Dark Theme colours -->
<Story name="Dark Theme" />

<!-- Light Theme colours -->
<Story name="Light Theme" args={{ theme: "light" }} />
