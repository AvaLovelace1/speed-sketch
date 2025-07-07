<script lang="ts">
    import { AlertDialog } from "bits-ui";
    import Card from "$lib/components/Card.svelte";
    import Overlay from "$lib/components/dialog/Overlay.svelte";
    import Popup from "$lib/components/dialog/Popup.svelte";

    interface Props {
        title: string;
        description: string;
        cancelText?: string;
        confirmText?: string;
        onOpen?: () => void;
        onCancel?: () => void;
        onConfirm?: () => void;
    }

    let {
        title,
        description,
        cancelText = "No",
        confirmText = "Yes",
        onOpen = () => {},
        onCancel = () => {},
        onConfirm = () => {},
    }: Props = $props();

    let openBind = $state(false);

    export function open() {
        openBind = true;
    }
</script>

<AlertDialog.Root
    bind:open={openBind}
    onOpenChangeComplete={(open) => {
        if (open) onOpen();
        else onCancel();
    }}
>
    <AlertDialog.Portal>
        <AlertDialog.Overlay forceMount>
            {#snippet child({ props, open })}
                {#if open}<Overlay {...props} />{/if}
            {/snippet}
        </AlertDialog.Overlay>
        <AlertDialog.Content forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <Popup {...props}>
                        <Card>
                            <AlertDialog.Title class="card-title mb-2">{title}</AlertDialog.Title>
                            <AlertDialog.Description class="mb-8">
                                {description}
                            </AlertDialog.Description>
                            <form onsubmit={onConfirm}>
                                <div class="card-actions justify-end">
                                    <AlertDialog.Cancel type="button" class="btn">
                                        {cancelText}
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action
                                        type="submit"
                                        class="btn btn-error"
                                        tabindex={0}
                                    >
                                        {confirmText}
                                    </AlertDialog.Action>
                                </div>
                            </form>
                            <AlertDialog.Cancel
                                class="text-muted absolute top-1 right-1 cursor-pointer p-2"
                            >
                                <span class="iconify lucide--x"></span>
                                <span class="sr-only">Close</span>
                            </AlertDialog.Cancel>
                        </Card>
                    </Popup>
                {/if}
            {/snippet}
        </AlertDialog.Content>
    </AlertDialog.Portal>
</AlertDialog.Root>
