<script lang="ts">
    import { type SchedulePreset } from "$lib/store/session-settings.svelte";
    import AlertDialog from "$lib/components/dialog/AlertDialog.svelte";
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Select from "$lib/components/input/Select.svelte";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import type { Tool } from "$lib/components/Toolbar.svelte";
    import { Label } from "bits-ui";

    export interface Props {
        schedulePresets?: SchedulePreset[];
        selectedIdx?: number;
        renameDisabled?: boolean;
        deleteDisabled?: boolean;
        onSelect?: (idx: number) => void;
        onAdd?: (name: string) => void;
        onRename?: (name: string) => void;
        onDelete?: () => void;
    }

    const {
        schedulePresets = [],
        selectedIdx = 0,
        renameDisabled = false,
        deleteDisabled = false,
        onSelect = (_) => {},
        onAdd = (_) => {},
        onRename = (_) => {},
        onDelete = () => {},
    }: Props = $props();

    let selectValue = $derived(selectedIdx.toString());
    const selectItems = $derived(
        schedulePresets.map((s, i) => ({ value: i.toString(), label: s.name })),
    );

    let addDialog: Dialog;
    let addName = $state("");
    let renameDialog: Dialog;
    let renameName = $state("");
    let deleteDialog: AlertDialog;

    const addTool: Tool = {
        uid: "add-schedule",
        icon: "lucide--list-plus",
        tooltip: "Add preset",
        action: () => {
            addName = "";
            addDialog.open();
        },
    };
    const renameTool: Tool = $derived({
        uid: "rename-schedule",
        icon: "lucide--pencil",
        tooltip: "Rename preset",
        action: () => {
            renameName = schedulePresets[selectedIdx]?.name ?? "";
            renameDialog.open();
        },
        disabled: renameDisabled,
    });
    const deleteTool: Tool = $derived({
        uid: "delete-schedule",
        icon: "lucide--trash-2",
        tooltip: "Delete preset",
        action: () => deleteDialog.open(),
        disabled: deleteDisabled,
    });
    const selectedName = $derived(schedulePresets[selectedIdx]?.name ?? "Preset");
    const tools = $derived([addTool, renameTool, deleteTool]);

    // Propagate user-driven selection changes to parent
    $effect(() => {
        const idx = parseInt(selectValue);
        if (idx !== selectedIdx) onSelect(idx);
    });

    function handleAdd() {
        const trimmed = addName.trim();
        if (trimmed) {
            onAdd(trimmed);
            addName = "";
            addDialog.close();
        }
    }

    function handleRename() {
        const trimmed = renameName.trim();
        if (trimmed) {
            onRename(trimmed);
            renameName = "";
            renameDialog.close();
        }
    }
</script>

<div class="w-full">
    <div class="flex items-center gap-2">
        <Select
            label="Schedule presets"
            items={selectItems}
            bind:value={selectValue}
            hideLabel
            width="w-full"
        />
        <Toolbar {tools} toolbarStyle="small" />
    </div>
</div>

<Dialog bind:this={addDialog} title="Add preset">
    <form
        onsubmit={(e) => {
            e.preventDefault();
            handleAdd();
        }}
    >
        <Label.Root for="add-schedule-name" class="mb-2 block text-sm text-muted">
            Enter a name for the new schedule preset
        </Label.Root>
        <input id="add-schedule-name" type="text" class="input mb-8 w-full" bind:value={addName} />
        <div class="flex justify-end gap-2">
            <button type="button" class="btn" onclick={() => addDialog.close()}>Cancel</button>
            <button type="submit" class="btn btn-primary" disabled={!addName.trim()}>Add</button>
        </div>
    </form>
</Dialog>

<Dialog bind:this={renameDialog} title="Rename preset">
    <form
        onsubmit={(e) => {
            e.preventDefault();
            handleRename();
        }}
    >
        <Label.Root for="rename-schedule-name" class="mb-2 block text-sm text-muted">
            Enter a new name for the schedule preset
        </Label.Root>
        <input
            id="rename-schedule-name"
            type="text"
            class="input mb-8 w-full"
            bind:value={renameName}
        />
        <div class="flex justify-end gap-2">
            <button type="button" class="btn" onclick={() => renameDialog.close()}>Cancel</button>
            <button type="submit" class="btn btn-primary" disabled={!renameName.trim()}>
                Rename
            </button>
        </div>
    </form>
</Dialog>

<AlertDialog
    bind:this={deleteDialog}
    title="Delete preset?"
    description={`“${selectedName}” will be permanently deleted`}
    confirmText="Delete"
    onConfirm={() => {
        deleteDialog.close();
        onDelete();
    }}
/>
