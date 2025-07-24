<script lang="ts">
    import { AlertDialog } from "bits-ui";
    import Card from "$lib/components/Card.svelte";
    import Overlay from "$lib/components/dialog/Overlay.svelte";
    import Popup from "$lib/components/dialog/Popup.svelte";

    export interface Props {
        title: string;
        description: string;
        cancelText?: string;
        confirmText?: string;
        onOpen?: () => void;
        onCancel?: () => void;
        onConfirm?: () => void;
    }

    const {
        title,
        description,
        cancelText = "Cancel",
        confirmText = "Confirm",
        onOpen = () => {},
        onCancel = () => {},
        onConfirm = () => {},
    }: Props = $props();

    let openBind = $state(false);

    export function open() {
        openBind = true;
        onOpen();
    }

    export function close() {
        openBind = false;
        onCancel();
    }
</script>

<AlertDialog.Root
    bind:open={openBind}
    onOpenChange={(open) => {
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
                            if (e.target === e.currentTarget) close();
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
                            <div class="flex justify-end gap-2">
                                <AlertDialog.Cancel class="btn">{cancelText}</AlertDialog.Cancel>
                                <AlertDialog.Action
                                    class="btn btn-error"
                                    onclick={onConfirm}
                                    tabindex={0}
                                >
                                    {confirmText}
                                </AlertDialog.Action>
                            </div>
                            <AlertDialog.Cancel
                                class="text-muted hover:text-base-content active:text-muted focus:text-base-content absolute top-1 right-1 cursor-pointer p-2"
                            >
                                <span class="iconify lucide--x">
                                    <span class="sr-only">Close</span>
                                </span>
                            </AlertDialog.Cancel>
                        </Card>
                    </Popup>
                {/if}
            {/snippet}
        </AlertDialog.Content>
    </AlertDialog.Portal>
</AlertDialog.Root>
