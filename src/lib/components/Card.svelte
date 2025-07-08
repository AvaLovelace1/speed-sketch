<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
    }
    const { children, ...props }: Props = $props();
</script>

<div {...props} class={["rounded-box bg-base-100 shadow-offblack/10 w-fit shadow-lg", props.class]}>
    {@render children()}
</div>
