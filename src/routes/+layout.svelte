<script lang="ts">
    import type {LayoutProps} from './$types';
    import '../app.css';

    let {children}: LayoutProps = $props();
</script>

{@render children()}
