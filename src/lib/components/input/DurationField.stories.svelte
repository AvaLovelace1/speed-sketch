<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import DurationField from "./DurationField.svelte";

    const { Story } = defineMeta({
        title: "Components/Input/DurationField",
        component: DurationField,
        tags: ["autodocs"],
    });
</script>

<!-- A duration entry field. -->
<Story name="Default" />
