<script lang="ts">
    import AlertDialog from "$lib/components/AlertDialog.svelte";

    interface Props {
        title: string;
        description: string;
        cancelText?: string;
        confirmText?: string;
    }

    const { title, description, cancelText = "No", confirmText = "Yes" }: Props = $props();

    let alertDialog: AlertDialog;
</script>

<button class="btn" onclick={() => alertDialog.open()}>Open Dialog</button>

<AlertDialog
    bind:this={alertDialog}
    {title}
    {description}
    {cancelText}
    {confirmText}
    onOpen={() => console.log("Dialog opened")}
    onCancel={() => console.log("Dialog cancelled")}
    onConfirm={() => console.log("Dialog confirmed")}
/>
