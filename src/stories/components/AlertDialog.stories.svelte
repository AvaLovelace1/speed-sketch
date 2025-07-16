<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import AlertDialog from "$lib/components/dialog/AlertDialog.svelte";

    const { Story } = defineMeta({
        title: "Components/AlertDialog",
        component: AlertDialog,
        tags: ["autodocs"],
    });

    let alertDialog: AlertDialog;
</script>

<!-- A modal dialog with two options: confirm or cancel. -->
<Story
    name="AlertDialog"
    args={{
        title: "Confirmation Dialog",
        description: "Are you absolutely sure you want to take this action?",
    }}
>
    {#snippet template(args)}
        <button class="btn" onclick={() => alertDialog.open()}>Open Dialog</button>
        <AlertDialog bind:this={alertDialog} {...args} />
    {/snippet}
</Story>
