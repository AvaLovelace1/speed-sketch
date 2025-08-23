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

<!-- More compact style. -->
<Story name="Small" args={{ inputStyle: "small" }} />

<!-- On a colored background. -->
<Story name="Primary Background" args={{ bgColor: "primary" }}>
    {#snippet template(args)}
        <div class="rounded bg-primary p-4">
            <DurationField {...args} />
        </div>
    {/snippet}
</Story>
