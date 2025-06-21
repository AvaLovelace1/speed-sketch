<!--
@component
A simple alert component for displaying status messages.
-->
<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
    }

    const { children, ...props }: Props = $props();
</script>

<div class="inline-block">
    <div
        role="status"
        {...props}
        class={["alert alert-soft gap-3 px-3 py-2 text-xl font-semibold shadow-sm!", props.class]}
    >
        {@render children()}
    </div>
</div>
