<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Checkbox from "$lib/atoms/Checkbox.svelte";

    const { Story } = defineMeta({
        title: "Atoms/Checkbox",
        component: Checkbox,
        tags: ["autodocs"],
        args: { label: "Checkbox" },
    });
</script>

<!-- A basic checkbox. -->
<Story name="Default" />
