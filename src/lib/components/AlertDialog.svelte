<script lang="ts">
    import { cubicOut } from "svelte/easing";
    import { fade, scale } from "svelte/transition";
    import { AlertDialog } from "bits-ui";
    import Card from "$lib/components/Card.svelte";

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
                {#if open}
                    <div
                        class="fixed inset-0 z-50 bg-black/75"
                        transition:fade={{ duration: 200, easing: cubicOut }}
                        {...props}
                    ></div>
                {/if}
            {/snippet}
        </AlertDialog.Overlay>
        <AlertDialog.Content forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <div class="fixed inset-0 z-50 flex items-center justify-center" {...props}>
                        <div transition:scale={{ start: 0.95, duration: 150, easing: cubicOut }}>
                            <Card>
                                <AlertDialog.Title class="card-title mb-2">
                                    {title}
                                </AlertDialog.Title>
                                <AlertDialog.Description class="mb-8">
                                    {description}
                                </AlertDialog.Description>
                                <form
                                    onsubmit={() => {
                                        openBind = false;
                                        onConfirm();
                                    }}
                                >
                                    <div class="card-actions justify-end">
                                        <AlertDialog.Cancel
                                            type="button"
                                            class="btn"
                                            onclick={onCancel}
                                        >
                                            {cancelText}
                                        </AlertDialog.Cancel>
                                        <AlertDialog.Action type="submit" class="btn btn-error">
                                            {confirmText}
                                        </AlertDialog.Action>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>
                {/if}
            {/snippet}
        </AlertDialog.Content>
    </AlertDialog.Portal>
</AlertDialog.Root>
