<!--
@component
Centers its children in the viewport and applies a scale transition.
-->
<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cubicOut } from "svelte/easing";
    import { scale } from "svelte-reduced-motion/transition";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
    }

    const { children, ...props }: Props = $props();
</script>

<div class="fixed inset-0 z-50 flex items-center-safe justify-center-safe overflow-auto" {...props}>
    <div transition:scale={{ start: 0.95, duration: 150, easing: cubicOut }}>
        {@render children()}
    </div>
</div>
