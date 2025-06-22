<!--
@component
A dark overlay that covers the entire viewport.
-->
<script lang="ts">
    import { cubicOut } from "svelte/easing";
    import { fade } from "svelte/transition";
    import type { HTMLAttributes } from "svelte/elements";

    const props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
    class="fixed inset-0 z-50 bg-black/75"
    transition:fade={{ duration: 200, easing: cubicOut }}
    {...props}
></div>
