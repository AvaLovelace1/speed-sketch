<!--
@component
Centers its children in the viewport and applies a scale transition.
-->
<script lang="ts">
    import type { SvelteHTMLElements } from "svelte/elements";
    import { scale } from "$lib/motion.svelte";

    const { children, ...props }: SvelteHTMLElements["div"] = $props();
</script>

<div
    class="fixed inset-0 z-50 flex items-center-safe justify-center-safe overflow-auto p-3"
    {...props}
>
    <div in:scale={{ duration: "medium" }} out:scale={{ duration: "short" }}>
        {@render children?.()}
    </div>
</div>
