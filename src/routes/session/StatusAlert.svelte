<script lang="ts">
    import type {Snippet} from 'svelte';

    interface Props {
        children: Snippet;

        [key: string]: any;
    }

    let {children, ...props} = $props();
</script>

<div role="status" {...props} class={['alert alert-soft shadow-sm p-2 flex gap-2', props.class]}>
    {@render children()}
</div>
