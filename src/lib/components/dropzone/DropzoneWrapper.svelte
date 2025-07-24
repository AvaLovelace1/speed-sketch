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
        "text-muted bg-base-200 hover:bg-base-300 rounded-box w-full cursor-pointer border-2 text-center inset-shadow-xs",
        isDragging ? draggingStyle : isInvalid ? invalidStyle : "border-base-100",
    ]}
>
    {@render children()}
</div>
