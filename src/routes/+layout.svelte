<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { LayoutProps } from "./$types";
    import { settings } from "$lib/globals.svelte";
    import "../app.css";

    const { children }: LayoutProps = $props();

    $effect(() => {
        // Set global theme based on user settings
        document.documentElement.setAttribute("data-theme", settings.theme);
    });
</script>

<Tooltip.Provider>
    {@render children()}
</Tooltip.Provider>
