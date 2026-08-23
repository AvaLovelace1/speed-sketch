<script lang="ts">
    import { Label, Select } from "bits-ui";
    import { fly } from "$lib/motion.svelte";
    import { stringToId } from "$lib/utils";

    const SIDE_OFFSET = 8;

    export interface Item {
        value: string;
        label: string;
        disabled?: boolean;
        icon?: string;
    }

    export interface ItemGroup {
        heading: string;
        items: Item[];
    }

    interface Props {
        label: string;
        items: (Item | ItemGroup)[];
        value: string;
        hideLabel?: boolean;
        width?: string;
        disabled?: boolean;
    }

    let {
        label,
        items,
        value = $bindable(),
        hideLabel = false,
        width = "w-3xs",
        disabled = false,
    }: Props = $props();

    function isItemGroup(item: Item | ItemGroup): item is ItemGroup {
        return "heading" in item;
    }

    const id = $derived(stringToId(`${label}-select`));
    const allItems = $derived(items.flatMap((item) => (isItemGroup(item) ? item.items : [item])));
    const itemsMap = $derived(new Map<string, Item>(allItems.map((item) => [item.value, item])));
</script>

{#snippet selectItem(option: Item)}
    <Select.Item
        class="flex cursor-pointer items-center
               justify-between rounded-field px-4 py-2 text-sm
               data-highlighted:bg-base-300 data-selected:bg-primary data-selected:text-primary-content"
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
{/snippet}

{#if !hideLabel}
    <Label.Root class="mb-2 block text-sm text-muted" for={id}>{label}</Label.Root>
{/if}
<Select.Root type="single" bind:value items={allItems} {disabled}>
    <Select.Trigger
        {id}
        class="select flex cursor-pointer items-center gap-2 active:bg-base-200 {width}"
        aria-label={label}
    >
        {#if itemsMap.get(value)?.icon}
            <div class="iconify text-stroke {itemsMap.get(value)?.icon}"></div>
        {/if}
        {itemsMap.get(value)?.label}
    </Select.Trigger>
    <Select.Portal>
        <Select.Content
            class="z-50 w-(--bits-select-anchor-width) rounded-box bg-base-200 p-2 shadow-md"
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
                                {#each items as entry, i (i)}
                                    {#if isItemGroup(entry)}
                                        {#if i > 0}<hr class="m-1 border-stroke-muted" />{/if}
                                        <Select.Group>
                                            <Select.GroupHeading
                                                class="p-2 text-xs font-semibold text-muted"
                                            >
                                                {entry.heading}
                                            </Select.GroupHeading>
                                            {#each entry.items as item (item.value)}
                                                {@render selectItem(item)}
                                            {/each}
                                        </Select.Group>
                                    {:else}
                                        {@render selectItem(entry)}
                                    {/if}
                                {/each}
                            </Select.Viewport>
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Select.Content>
    </Select.Portal>
</Select.Root>
