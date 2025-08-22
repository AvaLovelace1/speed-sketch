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

    const draggingBorder = "border-2 border-primary border-dashed";
    const invalidBorder = "border-2 border-error";
</script>

<div
    class={[
        "relative w-full cursor-pointer rounded-box text-center text-muted inset-shadow-xs hover:bg-base-300",
        "transition duration-(--daisyui-btn-duration) ease-(--daisyui-btn-ease)",
        isDragging ? "bg-base-300" : "bg-base-200",
    ]}
>
    <!-- Separate div as border for smoother transitions -->
    <div
        class={[
            "pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-[inherit] ease-[inherit]",
            isDragging ? draggingBorder : isInvalid ? invalidBorder : "opacity-0",
        ]}
    ></div>
    {@render children()}
</div>
