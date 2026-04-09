<!--
@component
A reorderable list with drag-and-drop support, single-item selection, and a toolbar.
-->
<script lang="ts" generics="T">
    import { ListManager } from "$lib/components/input/list-manager.svelte";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import type { Tool } from "$lib/components/Toolbar.svelte";
    import Sortable from "sortablejs";
    import type { Attachment } from "svelte/attachments";
    import { Button } from "bits-ui";
    import { prefersReducedMotion } from "svelte/motion";
    import { getDuration } from "$lib/motion.svelte";
    import { isTauri } from "@tauri-apps/api/core";
    import type { Snippet } from "svelte";

    interface Props {
        manager: ListManager<T>;
        caption?: string;
        emptyState?: Snippet;
        row: Snippet<[T, number, boolean]>;
        getKey: (item: T, index: number) => string;
        tools?: Tool[];
        onChange?: () => void;
    }

    const {
        manager,
        caption = "Reorderable list",
        emptyState,
        row,
        getKey = (_: T, index: number) => index.toString(),
        tools = [],
        onChange = () => {},
    }: Props = $props();

    let sortable: Sortable;

    const sortableAttachment: Attachment = (element) => {
        const node = element as HTMLElement;
        sortable = Sortable.create(node, {
            animation: prefersReducedMotion.current ? 0 : getDuration("medium"),
            handle: ".sortable-handle",
            forceFallback: isTauri(),
            onSort: (evt) => {
                const { oldIndex, newIndex } = evt;
                if (oldIndex === undefined || newIndex === undefined) return;
                manager.selectedIdx = oldIndex;
                if (oldIndex !== newIndex) manager.moveItem(newIndex);
                onChange();
            },
        });
        return () => {
            sortable.destroy();
        };
    };
</script>

<table class="mb-3 block">
    <caption class="sr-only">{caption}</caption>
    <tbody
        {@attach sortableAttachment}
        class="list max-h-48 overflow-auto rounded-box bg-base-200 inset-shadow-xs"
    >
        {#if manager.items.length === 0 && emptyState}
            <tr class="list-row flex justify-center text-center">
                <td>
                    {@render emptyState()}
                </td>
            </tr>
        {/if}
        {#each manager.items as item, i (getKey(item, i))}
            <tr
                class="group list-row flex items-center text-muted transition-[background-color]
                       duration-(--daisyui-btn-duration) ease-(--daisyui-btn-ease)
                       hover:bg-base-300 aria-selected:bg-primary aria-selected:text-primary-content"
                aria-selected={i === manager.selectedIdx}
                onclick={() => (manager.selectedIdx = i)}
                onfocusin={() => (manager.selectedIdx = i)}
                onkeydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        manager.selectedIdx = i;
                        e.preventDefault();
                    }
                }}
            >
                <td class="flex self-stretch">
                    <Button.Root
                        class="sortable-handle flex cursor-grab items-center
                           text-base text-stroke group-aria-selected:text-primary-content"
                        onmousedown={() => (manager.selectedIdx = i)}
                        type="button"
                    >
                        <span class="iconify lucide--grip-vertical"></span>
                        <span class="sr-only">Drag to reorder</span>
                    </Button.Root>
                </td>
                {@render row(item, i, i === manager.selectedIdx)}
            </tr>
        {/each}
    </tbody>
</table>
<Toolbar {tools} class="mb-6" toolbarStyle="small" />
