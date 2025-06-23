<script lang="ts">
    interface Props {
        label: string;
        icon?: string;
        min?: number;
        max?: number;
        step: number;
        value: number;
    }

    let { label, icon, min = 0, max = 100, step, value = $bindable() }: Props = $props();
</script>

<label class="text-muted mb-2 block" for="contrast-setting">{label}</label>
<div class="flex items-center gap-2">
    {#if icon}
        <div class="text-muted flex items-center text-base">
            <span class="iconify {icon}"></span>
        </div>
    {/if}
    <input
        id="contrast-setting"
        type="range"
        class="range range-primary"
        {min}
        {max}
        {step}
        bind:value
    />
</div>
