<!--
@component
A reorderable list of image folders with add/remove/move controls.
-->
<script lang="ts">
    import ReorderableList from "$lib/components/input/ReorderableList.svelte";
    import { ListManager } from "$lib/components/input/list-manager.svelte";
    import type { Tool } from "$lib/components/Toolbar.svelte";
    import { open } from "@tauri-apps/plugin-dialog";
    import { untrack } from "svelte";
    import { basename } from "$lib/utils.svelte";

    export interface Props {
        folders?: string[];
        onAdd?: () => Promise<string[] | null>;
        onChange?: () => void;
    }

    const { folders = $bindable([]), onAdd = defaultOnAdd, onChange = () => {} }: Props = $props();

    // Recreate manager when the folders array identity changes (e.g. from TauriDropzone)
    let manager = $derived.by(() => {
        const f = folders;
        return untrack(() => new ListManager(f));
    });

    async function defaultOnAdd(): Promise<string[] | null> {
        const result = await open({ directory: true, multiple: true, title: "Choose Folders" });
        if (!result) return null;
        return Array.isArray(result) ? result : [result];
    }

    async function addFolders() {
        const newFolders = await onAdd();
        if (!newFolders || newFolders.length === 0) return;
        for (const folder of newFolders) manager.addItem(folder);
        onChange();
    }

    const addBtn: Tool = {
        uid: "add-folder",
        icon: "lucide--folder-plus",
        action: addFolders,
        tooltip: "Add folder",
    };
    const removeBtn: Tool = $derived({
        uid: "remove-entry",
        icon: "lucide--folder-minus",
        action: () => {
            manager.removeItem();
            onChange();
        },
        tooltip: "Remove folder",
        disabled: manager.items.length === 0,
    });
    const moveUpBtn: Tool = $derived({
        uid: "move-entry-up",
        icon: "lucide--arrow-up-from-line",
        action: () => manager.moveItemUp(),
        tooltip: "Move folder up",
        disabled: manager.selectedIdx <= 0,
    });
    const moveDownBtn: Tool = $derived({
        uid: "move-entry-down",
        icon: "lucide--arrow-down-from-line",
        action: () => manager.moveItemDown(),
        tooltip: "Move folder down",
        disabled: manager.selectedIdx >= manager.items.length - 1,
    });
    const tools = $derived([addBtn, removeBtn, moveUpBtn, moveDownBtn]);
</script>

<ReorderableList
    {manager}
    caption="Image folders"
    getKey={(folder, i) => folder + i}
    {tools}
    {onChange}
>
    {#snippet emptyState()}
        <p class="p-1 text-xs text-muted">
            Use
            <span class="iconify align-middle text-base-content {addBtn.icon}"></span>
            <span class="sr-only">{addBtn.icon}</span>
            to add an image folder(s)
        </p>
    {/snippet}
    {#snippet row(folder: string, _index: number, _isSelected: boolean)}
        <td class="flex grow items-center gap-2 truncate text-sm" title={folder}>
            <span class="iconify lucide--folder"></span>
            {basename(folder)}
        </td>
    {/snippet}
</ReorderableList>
