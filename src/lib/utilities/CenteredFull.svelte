<!--
@component
Center content both vertically and horizontally, and take up the full viewport height.
-->
<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLElement> {
        children: Snippet;
        tag?: string;
    }
    const { children, tag = "div", ...props }: Props = $props();
</script>

<svelte:element
    this={tag}
    {...props}
    class={["flex h-dvh flex-col items-center-safe justify-center-safe", props.class]}
>
    {@render children()}
</svelte:element>
