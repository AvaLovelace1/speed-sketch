<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Checkbox from "./Checkbox.svelte";

    const { Story } = defineMeta({
        title: "Components/Input/Checkbox",
        component: Checkbox,
        tags: ["autodocs"],
        args: { label: "Checkbox" },
    });
</script>

<!-- A basic checkbox. -->
<Story name="Default" />
