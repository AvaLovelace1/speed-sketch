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
    import { basename } from "$lib/utils";

    export interface Props {
        folders?: string[];
        folderErrs?: Record<string, string>;
        onAdd?: () => Promise<string[] | null>;
        onChange?: () => void;
        onRefresh?: () => void;
    }

    const {
        folders = $bindable([]),
        folderErrs = {},
        onAdd = defaultOnAdd,
        onChange = () => {},
        onRefresh = () => {},
    }: Props = $props();

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
        action: () => {
            manager.moveItemUp();
            onChange();
        },
        tooltip: "Move folder up",
        disabled: manager.selectedIdx <= 0,
    });
    const moveDownBtn: Tool = $derived({
        uid: "move-entry-down",
        icon: "lucide--arrow-down-from-line",
        action: () => {
            manager.moveItemDown();
            onChange();
        },
        tooltip: "Move folder down",
        disabled: manager.selectedIdx >= manager.items.length - 1,
    });
    const refreshBtn: Tool = $derived({
        uid: "refresh-folders",
        icon: "lucide--refresh-cw",
        action: onRefresh,
        tooltip: "Refresh references",
        disabled: manager.items.length === 0,
        class: "ml-auto",
    });
    const tools = $derived([addBtn, removeBtn, moveUpBtn, moveDownBtn, refreshBtn]);
</script>

<ReorderableList
    {manager}
    caption="Reference folders"
    getKey={(folder, i) => folder + i}
    {tools}
    {onChange}
>
    {#snippet emptyState()}
        <button
            class="w-100 cursor-pointer p-1 text-xs text-muted"
            onclick={addFolders}
            type="button"
        >
            Use
            <span class="iconify align-text-bottom text-base-content {addBtn.icon}"></span>
            <span class="sr-only">{addBtn.icon}</span>
            or click to add reference folders
        </button>
    {/snippet}
    {#snippet row(folder: string, _index: number, _isSelected: boolean)}
        {@const folderErr = folderErrs[folder]}
        <td
            class="flex grow items-center gap-2 truncate text-sm"
            title={folderErr ? `${folder} — ${folderErr}` : folder}
        >
            <span
                class={[
                    "iconify shrink-0",
                    folderErr
                        ? "text-error lucide--folder-x group-aria-selected:text-primary-content"
                        : "lucide--folder",
                ]}
            ></span>
            <span class="truncate">{basename(folder)}</span>
            {#if folderErr}
                <span
                    class="ml-auto flex shrink-0 items-center gap-1 text-xs text-error italic
                           group-aria-selected:text-primary-content"
                >
                    <span class="iconify lucide--octagon-x"></span>
                    <span class="sr-only">Error</span>
                    {folderErr}
                </span>
            {/if}
        </td>
    {/snippet}
</ReorderableList>
