<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
    }

    let { children, ...props }: Props = $props();
</script>

<div role="status" {...props} class={['alert alert-soft flex gap-2 p-2 shadow-sm', props.class]}>
    {@render children()}
</div>
