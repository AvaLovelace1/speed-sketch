<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import StatusAlert from "./StatusAlert.svelte";

    const { Story } = defineMeta({
        title: "Components/StatusAlert",
        component: StatusAlert,
        tags: ["autodocs"],
    });
</script>

<!-- A simple container that displays status messages in a large font. -->
<Story name="Default">
    <span class="iconify lucide--heart"></span>Message
</Story>
