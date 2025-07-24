<!--
@component
Dropzone component for folder uploads.
-->
<script lang="ts">
    import Dropzone from "svelte-file-dropzone";
    import { onMount, type Snippet } from "svelte";
    import DropzoneWrapper from "$lib/components/dropzone/DropzoneWrapper.svelte";

    interface Props {
        // Acceptable file types, e.g. ["image/*", "video/*"]
        accept?: string[] | string | undefined;
        isInvalid?: boolean;
        // Called as soon as file is dropped or user clicks dropzone. Useful for setting "loading" state.
        onFileDropped?: () => void;
        // Called when user cancels the file dialog. Can be used to reset state set by `onFileDropped`.
        onFileDialogCancel?: () => void;
        // Callback to handle drop event
        onInput?: (inputFiles: File[]) => Promise<void>;
        children: Snippet;
    }

    const {
        accept = undefined,
        isInvalid = false,
        onFileDropped = () => {},
        onFileDialogCancel = () => {},
        onInput = async (_) => {},
        children,
    }: Props = $props();

    let isDragging = $state(false);
    let inputElement: HTMLInputElement | undefined = $state(undefined);

    async function onDrop(e: CustomEvent) {
        await onInput(e.detail.acceptedFiles);
    }

    onMount(async () => {
        inputElement?.setAttribute("webkitdirectory", "true");
    });
</script>

<DropzoneWrapper {isDragging} {isInvalid}>
    <Dropzone
        containerClasses="p-8"
        {accept}
        minSize={1}
        disableDefaultStyles
        onclick={() => {
            isDragging = false;
            onFileDropped();
        }}
        on:filedropped={() => {
            isDragging = false;
            onFileDropped();
        }}
        on:filedialogcancel={() => {
            isDragging = false;
            onFileDialogCancel();
        }}
        on:dragenter={() => (isDragging = true)}
        on:dragleave={() => (isDragging = false)}
        on:drop={onDrop}
        bind:inputElement
    >
        {@render children()}
    </Dropzone>
</DropzoneWrapper>
