<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        href: string;
        external?: boolean;
    }
    const { children, href, external = false }: Props = $props();
</script>

<a
    {href}
    class="hover:text-base-content hover:underline focus:text-base-content focus:underline active:text-primary"
    target={external ? "_blank" : "_self"}
    rel={external ? "external noopener noreferrer" : undefined}
    tabindex={0}
>
    {@render children()}
    {#if external}
        <span class="iconify align-text-bottom lucide--external-link">
            <span class="sr-only">(Opens in new tab)</span>
        </span>
    {/if}
</a>
