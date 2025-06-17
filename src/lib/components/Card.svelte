<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
    }
    const { children, ...props }: Props = $props();
</script>

<div {...props} class={["card bg-base-100 w-fit shadow-lg", props.class]}>
    <div class="card-body">
        {@render children()}
    </div>
</div>
