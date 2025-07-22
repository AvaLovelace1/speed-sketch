<!--
@component
A simple alert component for displaying status messages.
-->
<script lang="ts">
    import type { SvelteHTMLElements } from "svelte/elements";
    const { children, ...props }: SvelteHTMLElements["div"] = $props();
</script>

<div class="inline-block">
    <div
        role="status"
        {...props}
        class={["alert alert-soft gap-3 px-3 py-2 text-xl font-semibold shadow-sm!", props.class]}
    >
        {@render children?.()}
    </div>
</div>
