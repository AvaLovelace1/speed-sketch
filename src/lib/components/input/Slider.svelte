<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import { Label } from "bits-ui";
    import { stringToId } from "$lib/utils.svelte.js";

    interface Props extends HTMLInputAttributes {
        label: string;
        icon?: string;
        min?: number;
        max?: number;
        step?: number;
        value: number;
        formatValue?: (value: number) => string;
    }

    let {
        label,
        icon,
        min = 0,
        max = 100,
        step = 1,
        value = $bindable(),
        formatValue = (v) => v?.toString(),
        ...props
    }: Props = $props();

    const id = $derived(stringToId(`${label}-slider`));
</script>

<Label.Root class="mb-2 block text-sm text-muted" for={id}>{label}</Label.Root>
<div class="flex items-center gap-2">
    {#if icon}
        <span class="iconify text-stroke {icon}"></span>
    {/if}
    <input
        {id}
        type="range"
        class="range range-primary"
        tabindex={0}
        {min}
        {max}
        {step}
        bind:value
        {...props}
    />
    <div class="text-xs text-muted tabular-nums">{formatValue(value)}</div>
</div>
