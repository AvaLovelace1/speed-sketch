<script lang="ts">
    import { type HTMLInputAttributes } from "svelte/elements";
    import { Label } from "bits-ui";
    import { stringToId } from "$lib/utils.svelte.js";

    interface Props extends HTMLInputAttributes {
        label: string;
        icon?: string;
        min?: number;
        max?: number;
        step?: number;
        value: number;
    }

    let {
        label,
        icon,
        min = 0,
        max = 100,
        step = 1,
        value = $bindable(),
        ...props
    }: Props = $props();

    const id = stringToId(`${label}-slider`);
</script>

<Label.Root class="text-muted mb-2 block text-sm" for={id}>{label}</Label.Root>
<div class="flex items-center gap-2">
    {#if icon}
        <span class="text-stroke iconify {icon}"></span>
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
</div>
