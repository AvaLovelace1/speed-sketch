<script lang="ts">
    import type { Snippet } from "svelte";
    import { Dialog } from "bits-ui";
    import Card from "$lib/components/Card.svelte";
    import Overlay from "$lib/components/dialog/Overlay.svelte";
    import Popup from "$lib/components/dialog/Popup.svelte";

    interface Props extends Dialog.TriggerProps {
        title: string;
        onOpen?: () => void;
        onClose?: () => void;
        children: Snippet;
    }

    let { title, onOpen = () => {}, onClose = () => {}, children }: Props = $props();

    let openBind = $state(false);

    export function open() {
        openBind = true;
    }

    export function setOnOpen(fn: () => void) {
        onOpen = fn;
    }

    export function setOnClose(fn: () => void) {
        onClose = fn;
    }
</script>

<Dialog.Root
    bind:open={openBind}
    onOpenChangeComplete={(open) => {
        if (open) onOpen();
        else onClose();
    }}
>
    <Dialog.Portal>
        <Dialog.Overlay forceMount>
            {#snippet child({ props, open })}
                {#if open}<Overlay {...props} />{/if}
            {/snippet}
        </Dialog.Overlay>
        <Dialog.Content forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <Popup
                        {...props}
                        onclick={(e) => {
                            if (e.target === e.currentTarget) openBind = false;
                        }}
                    >
                        <Card class="relative p-8">
                            <Dialog.Title class="mb-8 text-2xl font-semibold">{title}</Dialog.Title>
                            <Dialog.Description>{@render children()}</Dialog.Description>
                            <Dialog.Close
                                class="text-muted hover:text-base-content active:text-muted focus-visible:text-base-content absolute top-1 right-1 cursor-pointer p-2"
                            >
                                <span class="iconify lucide--x"></span>
                                <span class="sr-only">Close</span>
                            </Dialog.Close>
                        </Card>
                    </Popup>
                {/if}
            {/snippet}
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
