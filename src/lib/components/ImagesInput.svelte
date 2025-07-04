<!--
@component
A dropzone component for uploading an image folder.
-->
<script lang="ts">
    import Dropzone from "svelte-file-dropzone";
    import type { HTMLAttributes } from "svelte/elements";
    import { onMount, type Snippet } from "svelte";
    import { isTauri } from "@tauri-apps/api/core";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        id: string;
        // Is called as soon as file is dropped or user clicks dropzone. Useful for setting "loading" state.
        onFileDropped?: () => void;
        // Called when user cancels the file dialog. Can be used to reset state set by `onFileDropped`.
        onFileDialogCancel?: () => void;
        // Callback to handle drop event
        onDrop?: (e: CustomEvent) => void;
        children: Snippet;
    }

    let {
        id,
        onFileDropped = () => {},
        onFileDialogCancel = () => {},
        onDrop = (_) => {},
        children,
        ...props
    }: Props = $props();

    let isDragging = $state(false);
    let inputElement: HTMLInputElement | undefined = $state(undefined);

    onMount(() => {
        if (inputElement) inputElement?.setAttribute("webkitdirectory", "true");
    });
</script>

<div
    {...props}
    class={[
        "text-muted bg-base-200 hover:bg-base-300 rounded-box border-base-100 w-full cursor-pointer border-2 inset-shadow-xs",
        isDragging ? "bg-base-300 border-primary border-dashed" : "",
        props.class,
    ]}
>
    {#if isTauri()}{:else}
        <Dropzone
            {id}
            containerClasses="p-8 text-shadow-2xs"
            accept={["image/*"]}
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
            required
        >
            {@render children()}
        </Dropzone>
    {/if}
</div>
