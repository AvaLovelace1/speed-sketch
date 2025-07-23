<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Card from "./Card.svelte";

    const { Story } = defineMeta({
        title: "Components/Card",
        component: Card,
        tags: ["autodocs"],
    });
</script>

<!-- A simple card container for displaying content in a box. -->
<Story name="Default">
    <div class="p-6">
        <h1 class="mb-2 text-xl font-semibold">Card title</h1>
        <p>Anything can go inside a card.</p>
    </div>
</Story>
