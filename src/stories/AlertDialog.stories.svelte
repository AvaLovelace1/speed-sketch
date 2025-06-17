<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import AlertDialog from "./AlertDialog.svelte";

    const { Story } = defineMeta({
        title: "AlertDialog",
        component: AlertDialog,
        tags: ["autodocs"],
    });
</script>

<!-- A modal dialog with two options: confirm or cancel. -->
<Story
    name="AlertDialog"
    args={{
        title: "Confirmation Dialog",
        description: "Are you absolutely sure you want to take this action?",
    }}
/>
