<script lang="ts">
    import { cubicOut } from 'svelte/easing';
    import { fade, scale } from 'svelte/transition';
    import { AlertDialog } from 'bits-ui';

    interface Props {
        title: string;
        description: string;
        cancelText: string;
        confirmText: string;
        onOpen?: () => void;
        onCancel?: () => void;
        onConfirm?: () => void;
    }

    let {
        title,
        description,
        cancelText,
        confirmText,
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
                        <div
                            class="card bg-base-100 w-fit shadow-lg"
                            transition:scale={{ start: 0.95, duration: 150, easing: cubicOut }}
                        >
                            <div class="card-body">
                                <AlertDialog.Title class="card-title">{title}</AlertDialog.Title>
                                <AlertDialog.Description class="mb-5">
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
                            </div>
                        </div>
                    </div>
                {/if}
            {/snippet}
        </AlertDialog.Content>
    </AlertDialog.Portal>
</AlertDialog.Root>
