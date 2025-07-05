<!--
@component
A dropzone component for uploading an image folder.
-->
<script lang="ts">
    import Dropzone from "svelte-file-dropzone";
    import type { HTMLAttributes } from "svelte/elements";
    import { onDestroy, onMount, type Snippet } from "svelte";
    import { isTauri } from "@tauri-apps/api/core";
    import type { UnlistenFn, Event } from "@tauri-apps/api/event";
    import { type DragDropEvent, getCurrentWebview } from "@tauri-apps/api/webview";
    import { open } from "@tauri-apps/plugin-dialog";
    import type { Image } from "$lib/types.svelte";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        id: string;
        // Is called as soon as file is dropped or user clicks dropzone. Useful for setting "loading" state.
        onFileDropped?: () => void;
        // Called when user cancels the file dialog. Can be used to reset state set by `onFileDropped`.
        onFileDialogCancel?: () => void;
        // Callback to handle drop event
        onImagesInput?: (inputFolderOrImgs: string | Image[] | null) => Promise<void>;
        children: Snippet;
    }

    let {
        onFileDropped = () => {},
        onFileDialogCancel = () => {},
        onImagesInput = async (_) => {},
        children,
        ...props
    }: Props = $props();

    let isDragging = $state(false);
    let inputElement: HTMLInputElement | undefined = $state(undefined);
    let unlistenDragDrop: UnlistenFn;

    async function chooseFolder() {
        const folder = await open({ directory: true, multiple: false, title: "Choose Folder" });
        if (folder) await onImagesInput(folder);
    }

    async function tauriDragDropHandler(e: Event<DragDropEvent>) {
        if (e.payload.type === "enter") isDragging = true;
        else if (e.payload.type === "leave") isDragging = false;
        else if (e.payload.type === "drop") {
            isDragging = false;
            const paths = e.payload.paths;

            if (paths.length === 0) return;
            if (paths.length > 1) {
                console.warn("Multiple paths dropped, only the first will be used.");
            }
            await onImagesInput(paths[0]);
        }
    }

    async function onDrop(e: CustomEvent) {
        const inputFiles: File[] = e.detail.acceptedFiles;
        const inputImgs = inputFiles.map((file) => {
            return {
                name: file.name,
                url: URL.createObjectURL(file),
                path: file.webkitRelativePath,
            };
        });
        await onImagesInput(inputImgs);
    }

    onMount(async () => {
        if (isTauri()) {
            unlistenDragDrop = await getCurrentWebview().onDragDropEvent(tauriDragDropHandler);
        }
        if (inputElement) inputElement?.setAttribute("webkitdirectory", "true");
    });

    onDestroy(() => {
        if (unlistenDragDrop) unlistenDragDrop();
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
    {#if isTauri()}
        <button class="size-full cursor-pointer p-8 text-shadow-2xs" onclick={chooseFolder}>
            {@render children()}
        </button>
    {:else}
        <Dropzone
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
