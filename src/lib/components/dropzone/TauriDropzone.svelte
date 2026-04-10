<!--
@component
Dropzone component for folder uploads.
-->
<script lang="ts">
    import { onDestroy, onMount, type Snippet } from "svelte";
    import type { UnlistenFn, Event } from "@tauri-apps/api/event";
    import { type DragDropEvent, getCurrentWebview } from "@tauri-apps/api/webview";
    import { open } from "@tauri-apps/plugin-dialog";
    import DropzoneWrapper from "$lib/components/dropzone/DropzoneWrapper.svelte";
    import { isTauri } from "@tauri-apps/api/core";

    interface Props {
        isInvalid?: boolean;
        onInput?: (inputFolders: string[]) => Promise<void>;
        children: Snippet;
    }

    const { isInvalid = false, onInput = async (_) => {}, children }: Props = $props();

    let isDragging = $state(false);
    let unlistenDragDrop: UnlistenFn;

    async function chooseFolder() {
        const folders = await open({ directory: true, multiple: true, title: "Choose Folders" });
        if (folders) await onInput(Array.isArray(folders) ? folders : [folders]);
    }

    async function tauriDragDropHandler(e: Event<DragDropEvent>) {
        if (e.payload.type === "enter") isDragging = true;
        else if (e.payload.type === "leave") isDragging = false;
        else if (e.payload.type === "drop") {
            isDragging = false;
            const paths = e.payload.paths;

            if (paths.length === 0) return;
            await onInput(paths);
        }
    }

    onMount(async () => {
        if (isTauri()) {
            unlistenDragDrop = await getCurrentWebview().onDragDropEvent(tauriDragDropHandler);
        }
    });

    onDestroy(() => {
        unlistenDragDrop?.();
    });
</script>

<DropzoneWrapper {isDragging} {isInvalid}>
    <button class="size-full cursor-pointer p-8" onclick={chooseFolder} type="button">
        {@render children()}
    </button>
</DropzoneWrapper>
