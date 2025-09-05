<!--
@component
An SVG grid overlay, with specified number of rows and columns.
-->
<script lang="ts">
    import type { SvelteHTMLElements } from "svelte/elements";

    type Props = {
        rows: number;
        cols: number;
        strokeWidth?: number;
    } & SvelteHTMLElements["svg"];

    const { rows, cols, strokeWidth = 1, ...props }: Props = $props();

    let paths = $derived.by(() => {
        const horizontal = Array.from({ length: rows - 1 }, (_, r) => `M 0 ${r + 1} H ${cols}`);
        const vertical = Array.from({ length: cols - 1 }, (_, c) => `M ${c + 1} 0 V ${rows}`);
        return horizontal.join(" ") + " " + vertical.join(" ");
    });
</script>

<svg
    viewBox="0 0 {cols} {rows}"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="crispEdges"
    stroke="currentColor"
    role="presentation"
    aria-label="Grid overlay"
    {...props}
>
    <rect
        width={cols}
        height={rows}
        stroke-width={2 * strokeWidth}
        vector-effect="non-scaling-stroke"
        fill="none"
    />
    <path d={paths} stroke-width={strokeWidth} vector-effect="non-scaling-stroke" fill="none" />
</svg>
