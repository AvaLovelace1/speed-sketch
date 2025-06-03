<script lang="ts">
    import type {Snippet} from 'svelte';

    interface Props {
        alertClass?: string;
        children: Snippet;
    }

    let {alertClass = '', children}: Props = $props();
</script>

<div role="status" class="alert alert-soft {alertClass} shadow-sm p-2 flex gap-2">
    {@render children()}
</div>
