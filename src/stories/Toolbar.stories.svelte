<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Toolbar from "./Toolbar.svelte";

    const { Story } = defineMeta({
        title: "Toolbar",
        component: Toolbar,
        tags: ["autodocs"],
    });
</script>

<!-- A toolbar with a set of tools/actions and keyboard shortcuts. -->
<Story name="Toolbar" />
