<script lang="ts">
    import type { SvelteHTMLElements } from "svelte/elements";
    const { children, ...props }: SvelteHTMLElements["div"] = $props();
</script>

<div {...props} class={["rounded-box bg-base-100 w-fit shadow-lg", props.class]}>
    {@render children?.()}
</div>
