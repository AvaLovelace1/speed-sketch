<script lang="ts">
    import { AlertDialog } from "bits-ui";
    import Card from "$lib/components/Card.svelte";
    import Overlay from "$lib/components/dialog/Overlay.svelte";
    import Popup from "$lib/components/dialog/Popup.svelte";

    interface Props {
        title?: string;
        description?: string;
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
                    <Popup
                        {...props}
                        onclick={(e) => {
                            if (e.target === e.currentTarget) openBind = false;
                        }}
                    >
                        <Card class="relative p-6">
                            {#if title}
                                <AlertDialog.Title class="mb-3 text-xl font-semibold">
                                    {title}
                                </AlertDialog.Title>
                            {/if}
                            {#if description}
                                <AlertDialog.Description class="text-muted mb-8 text-sm">
                                    {description}
                                </AlertDialog.Description>
                            {/if}
                            <form onsubmit={onConfirm}>
                                <div class="flex justify-end gap-2">
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
                                class="text-muted hover:text-base-content active:text-muted focus-visible:text-base-content absolute top-1 right-1 cursor-pointer p-2"
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
