<!--
@component
A dark overlay that covers the entire viewport.
-->
<script lang="ts">
    import { fade } from "$lib/motion.svelte";
    import type { SvelteHTMLElements } from "svelte/elements";

    const props: SvelteHTMLElements["div"] = $props();
</script>

<div
    class="fixed inset-0 z-50 bg-offblack/75"
    in:fade={{ duration: "long" }}
    out:fade={{ duration: "medium" }}
    {...props}
></div>
