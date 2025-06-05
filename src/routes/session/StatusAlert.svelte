<script lang="ts">
    import type {Snippet} from 'svelte';
    import type {HTMLAttributes} from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
    }

    let {children, ...props}: Props = $props();
</script>

<div role="status" {...props} class={['alert alert-soft shadow-sm p-2 flex gap-2', props.class]}>
    {@render children()}
</div>
