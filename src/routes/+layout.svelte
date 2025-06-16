<script lang="ts">
    import type { LayoutProps } from './$types';
    import '../app.css';
    import { Tooltip } from 'bits-ui';

    const { children }: LayoutProps = $props();
</script>

<Tooltip.Provider>
    {@render children()}
</Tooltip.Provider>
