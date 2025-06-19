<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import type { ClassValue } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        cardBodyClass?: ClassValue;
    }
    const { children, cardBodyClass = "", ...props }: Props = $props();
</script>

<div {...props} class={["card bg-base-100 w-fit shadow-lg", props.class]}>
    <div class={["card-body", cardBodyClass]}>
        {@render children()}
    </div>
</div>
