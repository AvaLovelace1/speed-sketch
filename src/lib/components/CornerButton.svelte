<!--
@component
Button that appears fixed in the top right corner.
-->
<script lang="ts">
    import Tooltip from "$lib/components/Tooltip.svelte";
    import type { SvelteHTMLElements } from "svelte/elements";

    type Props = {
        name: string;
        icon: string;
    } & SvelteHTMLElements["button"];

    const { name, icon, ...props }: Props = $props();
</script>

<Tooltip
    side="left"
    onclick={props.onclick}
    class={["btn fixed right-4 btn-circle size-12 rounded-full text-xl shadow-sm", props.class]}
>
    <span class="iconify {icon}"></span>
    <span class="sr-only">{name}</span>
    {#snippet tooltipContent()}<p>{name}</p>{/snippet}
</Tooltip>
