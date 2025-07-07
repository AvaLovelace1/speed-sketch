<script lang="ts">
    import AlertDialog from "$lib/components/dialog/AlertDialog.svelte";

    const props = $props();

    let alertDialog: AlertDialog;
</script>

<button class="btn" onclick={() => alertDialog.open()}>Open Dialog</button>

<AlertDialog bind:this={alertDialog} {...props} />
