<!--
@component
A styled wrapper for the dropzone area.
-->
<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        isDragging?: boolean;
        isInvalid?: boolean;
        children: Snippet;
    }

    const { isInvalid = false, isDragging = false, children }: Props = $props();

    const draggingStyle = "bg-base-300 border-primary border-dashed";
    const invalidStyle = "border-error";
</script>

<div
    class={[
        "w-full cursor-pointer rounded-box border-2 bg-base-200 text-center text-muted inset-shadow-xs hover:bg-base-300",
        isDragging ? draggingStyle : isInvalid ? invalidStyle : "border-base-100",
    ]}
>
    {@render children()}
</div>
