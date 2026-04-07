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
        deleteDisabled?: boolean;
        onSelect?: (idx: number) => void;
        onAdd?: (name: string) => void;
        onDelete?: () => void;
    }

    const {
        schedulePresets = [],
        selectedIdx = 0,
        deleteDisabled = false,
        onSelect = (_) => {},
        onAdd = (_) => {},
        onDelete = () => {},
    }: Props = $props();

    let selectValue = $derived(selectedIdx.toString());
    const selectItems = $derived(
        schedulePresets.map((s, i) => ({ value: i.toString(), label: s.name })),
    );

    let addDialog: Dialog;
    let addName = $state("");
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
    const deleteTool: Tool = $derived({
        uid: "delete-schedule",
        icon: "lucide--trash-2",
        tooltip: "Delete preset",
        action: () => deleteDialog.open(),
        disabled: deleteDisabled,
    });
    const selectedName = $derived(schedulePresets[selectedIdx]?.name ?? "this preset");
    const tools = $derived([addTool, deleteTool]);

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

<AlertDialog
    bind:this={deleteDialog}
    title="Delete preset"
    description={`Are you sure you want to delete "${selectedName}"?`}
    confirmText="Delete"
    onConfirm={() => {
        deleteDialog.close();
        onDelete();
    }}
/>
