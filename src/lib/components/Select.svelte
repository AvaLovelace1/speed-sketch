<script lang="ts">
    import { Select } from "bits-ui";
    import { fly } from "svelte/transition";

    interface Item {
        value: string;
        label: string;
        disabled?: boolean;
        icon?: string;
    }

    interface Props {
        value: string;
        items: Map<string, Item>;
    }

    let { value = $bindable(), items }: Props = $props();
</script>

<Select.Root type="single" bind:value items={[...items.values()]}>
    <Select.Trigger class="select w-3xs">
        {#if items.get(value)?.icon}
            <span class="iconify {items.get(value)?.icon} text-muted"></span>
        {/if}
        {items.get(value)?.label}
    </Select.Trigger>
    <Select.Portal>
        <Select.Content
            class="bg-base-200 rounded-box z-50 w-3xs p-2 shadow-md"
            sideOffset={8}
            forceMount
        >
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div {...props} transition:fly={{ y: -10, duration: 200 }}>
                            <Select.Viewport>
                                {#each items.values() as option, i (i + option.value)}
                                    <Select.Item
                                        class="data-highlighted:bg-base-300 data-selected:bg-primary data-selected:text-primary-content
                                               rounded-field flex cursor-pointer items-center justify-between px-4 py-2 text-sm"
                                        value={option.value}
                                        label={option.label}
                                    >
                                        {#snippet children({ selected })}
                                            <div>{option.label}</div>
                                            {#if selected}
                                                <div class="iconify lucide--check"></div>
                                            {/if}
                                        {/snippet}
                                    </Select.Item>
                                {/each}
                            </Select.Viewport>
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Select.Content>
    </Select.Portal>
</Select.Root>
