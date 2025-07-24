<!--
@component
A dropzone component for uploading an image folder, in a Tauri or web environment.
-->
<script lang="ts">
    import type { Image } from "$lib/types.svelte.js";
    import TauriDropzone from "$lib/components/dropzone/TauriDropzone.svelte";
    import WebDropzone from "$lib/components/dropzone/WebDropzone.svelte";
    import ImageGrid from "$lib/components/ImageGrid.svelte";

    interface Props {
        imgs?: Image[];
        folder?: string;
        isLoading?: boolean;
        errMsg?: string;
        onInput?: (inputImgsOrFolder: string | Image[] | null) => Promise<void>;
        isTauri?: boolean;
    }

    let {
        imgs = [],
        folder = "",
        isLoading = $bindable(false),
        errMsg = "",
        onInput = async (_) => {},
        isTauri = false,
    }: Props = $props();
</script>

{#snippet content()}
    {#if folder}
        <p
            class={[
                "text-base-content mx-auto mb-4 w-xs text-center text-sm",
                errMsg && "text-error",
            ]}
        >
            <span class="iconify lucide--folder text-muted align-text-bottom"></span>
            <span class="sr-only">Folder</span>
            {folder}
        </p>
    {/if}
    {#if isLoading || imgs.length > 0}
        <div class="mx-auto mt-3 mb-6 w-xs">
            <ImageGrid {imgs} {isLoading} maxImgs={8} gridClass="grid-cols-4 gap-1"></ImageGrid>
        </div>
        <p class="text-xs font-semibold">Drag & drop or click to choose another folder</p>
    {:else if errMsg}
        <p role="status" class="text-error mb-4 text-xl font-semibold">
            <span class="iconify lucide--octagon-x align-text-bottom"></span>
            <span class="sr-only">Error</span>
            {errMsg}
        </p>
        <p class="text-sm font-semibold">Drag & drop or click to choose another folder</p>
    {:else}
        <span class="iconify lucide--download text-xl"></span>
        <p class="text-sm font-semibold">Drag & drop or click to choose folder</p>
    {/if}
    {#if !isTauri}
        <p class="text-center">
            <small class="text-xs">
                Images are stored on your device and will <strong>not</strong> be uploaded
            </small>
        </p>
    {/if}
{/snippet}

{#if isTauri}
    <TauriDropzone isInvalid={errMsg !== ""} {onInput}>
        {@render content()}
    </TauriDropzone>
{:else}
    <WebDropzone
        accept="image/*"
        isInvalid={errMsg !== ""}
        onFileDropped={() => (isLoading = true)}
        onFileDialogCancel={() => (isLoading = false)}
        onInput={async (inputFiles: File[]) => {
            const inputImgs = inputFiles.map((file) => {
                return {
                    name: file.name,
                    url: URL.createObjectURL(file),
                };
            });
            await onInput(inputImgs);
        }}
    >
        {@render content()}
    </WebDropzone>
{/if}
