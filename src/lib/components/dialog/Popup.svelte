<!--
@component
Centers its children in the viewport and applies a scale transition.
-->
<script lang="ts">
    import type { SvelteHTMLElements } from "svelte/elements";
    import { cubicOut } from "svelte/easing";
    import { scale } from "svelte/transition";
    import { prefersReducedMotion } from "svelte/motion";

    const { children, ...props }: SvelteHTMLElements["div"] = $props();
</script>

<div
    class="fixed inset-0 z-50 flex items-center-safe justify-center-safe overflow-auto p-3"
    {...props}
>
    <div
        transition:scale={{
            start: prefersReducedMotion.current ? 1 : 0.95,
            duration: 150,
            easing: cubicOut,
        }}
    >
        {@render children?.()}
    </div>
</div>
