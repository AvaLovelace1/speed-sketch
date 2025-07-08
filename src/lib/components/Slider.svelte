<script lang="ts">
    import { type HTMLInputAttributes } from "svelte/elements";

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

    const id = label.replace(/\s+/g, "-");
</script>

<label class="text-muted mb-2 block text-sm" for={id}>{label}</label>
<div class="flex items-center gap-2">
    {#if icon}
        <div class="text-stroke flex items-center text-base">
            <span class="iconify {icon}"></span>
        </div>
    {/if}
    <input
        {id}
        type="range"
        class="range range-primary"
        tabindex="0"
        {min}
        {max}
        {step}
        bind:value
        {...props}
    />
</div>
