<script lang="ts">
    import type { LayoutProps } from './$types';
    import '../app.css';

    const { children }: LayoutProps = $props();
</script>

{@render children()}
