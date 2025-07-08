<!--
@component
A dark overlay that covers the entire viewport.
-->
<script lang="ts">
    import { cubicOut } from "svelte/easing";
    import { fade } from "svelte-reduced-motion/transition";
    import type { HTMLAttributes } from "svelte/elements";

    const props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
    class="bg-offblack/75 fixed inset-0 z-50"
    transition:fade={{ duration: 200, easing: cubicOut }}
    {...props}
></div>
