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
    class="hover:text-base-content focus:text-base-content active:text-primary hover:underline focus:underline"
    target={external ? "_blank" : "_self"}
    rel={external ? "external noopener noreferrer" : undefined}
    tabindex={0}
>
    {@render children()}
    {#if external}
        <span class="iconify lucide--external-link align-text-bottom">
            <span class="sr-only">(Opens in new tab)</span>
        </span>
    {/if}
</a>
