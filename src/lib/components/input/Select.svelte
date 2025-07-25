<script lang="ts">
    import { Label, Select } from "bits-ui";
    import { fly } from "$lib/motion.svelte";
    import { stringToId } from "$lib/utils.svelte.js";

    const SIDE_OFFSET = 8;

    interface Item {
        value: string;
        label: string;
        disabled?: boolean;
        icon?: string;
    }

    interface Props {
        label: string;
        items: Item[];
        value: string;
    }

    let { label, items, value = $bindable() }: Props = $props();

    const id = stringToId(`${label}-select`);
    const itemsMap = new Map<string, Item>(items.map((item) => [item.value, item]));
</script>

<Label.Root class="text-muted mb-2 block text-sm" for={id}>{label}</Label.Root>
<Select.Root type="single" bind:value items={[...items.values()]}>
    <Select.Trigger
        {id}
        class="select active:bg-base-200 flex w-3xs cursor-pointer items-center gap-2"
    >
        {#if itemsMap.get(value)?.icon}
            <div class="text-stroke iconify {itemsMap.get(value)?.icon}"></div>
        {/if}
        {itemsMap.get(value)?.label}
    </Select.Trigger>
    <Select.Portal>
        <Select.Content
            class="bg-base-200 rounded-box z-50 w-(--bits-select-anchor-width) p-2 shadow-md"
            sideOffset={SIDE_OFFSET}
            forceMount
        >
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div
                            {...props}
                            in:fly={{ y: -SIDE_OFFSET, duration: "medium" }}
                            out:fly={{ y: -SIDE_OFFSET, duration: "short" }}
                        >
                            <Select.Viewport>
                                {#each items.values() as option, i (i + option.value)}
                                    <Select.Item
                                        class="data-highlighted:bg-base-300 data-selected:bg-primary data-selected:text-primary-content
                                               rounded-field flex cursor-pointer items-center justify-between px-4 py-2 text-sm"
                                        value={option.value}
                                        label={option.label}
                                    >
                                        {#snippet children({ selected })}
                                            {option.label}
                                            {#if selected}
                                                <span class="iconify lucide--check"></span>
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
