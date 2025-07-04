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
        onDrop?: (e: CustomEvent) => void;
        children: Snippet;
    }

    let { id, onDrop = (_) => {}, children, ...props }: Props = $props();

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
            on:filedropped={() => (isDragging = false)}
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
