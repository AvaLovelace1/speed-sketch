<script lang="ts">
    import NumberField from "$lib/components/input/NumberField.svelte";
    import DurationField from "$lib/components/input/DurationField.svelte";
    import { Scheduler } from "$lib/components/input/scheduler.svelte";
    import type { ScheduleEntry, SessionSchedule } from "$lib/drawing-session.svelte";
    import ReorderableList from "$lib/components/input/ReorderableList.svelte";
    import type { Tool } from "$lib/components/Toolbar.svelte";
    import prettyMilliseconds from "pretty-ms";
    import { Label } from "bits-ui";
    import { untrack } from "svelte";

    export interface Props {
        schedule?: SessionSchedule;
    }

    const { schedule = $bindable([]) }: Props = $props();
    // Only recreate Scheduler when the schedule prop identity changes (e.g. switching presets)
    let scheduler = $derived.by(() => {
        const s = schedule;
        return untrack(() => new Scheduler(s));
    });

    const addBtn: Tool = {
        uid: "add-entry",
        icon: "lucide--plus",
        action: () => scheduler.addEntry(),
        tooltip: "Add drawing interval",
    };
    const addBreakBtn: Tool = {
        uid: "add-break",
        icon: "lucide--coffee",
        action: () => scheduler.addBreak(),
        tooltip: "Add break",
    };
    const removeBtn: Tool = $derived({
        uid: "remove-entry",
        icon: "lucide--minus",
        action: () => scheduler.removeItem(),
        tooltip: "Remove entry",
        disabled: schedule.length === 0,
    });
    const moveUpBtn: Tool = $derived({
        uid: "move-entry-up",
        icon: "lucide--arrow-up-from-line",
        action: () => scheduler.moveItemUp(),
        tooltip: "Move entry up",
        disabled: scheduler.selectedIdx <= 0,
    });
    const moveDownBtn: Tool = $derived({
        uid: "move-entry-down",
        icon: "lucide--arrow-down-from-line",
        action: () => scheduler.moveItemDown(),
        tooltip: "Move entry down",
        disabled: scheduler.selectedIdx >= schedule.length - 1,
    });
    const tools = $derived([addBtn, addBreakBtn, removeBtn, moveUpBtn, moveDownBtn]);
</script>

<ReorderableList
    manager={scheduler}
    caption="Scheduler input"
    getKey={(entry, i) => entry.id + i.toString()}
    {tools}
>
    {#snippet emptyState()}
        <p class="p-1 text-xs text-muted">
            Use
            <span class="iconify align-middle text-base-content {addBtn.icon}"></span>
            <span class="sr-only">{addBtn.tooltip}</span>
            to add a drawing interval
            <br />
            or
            <span class="iconify align-middle text-base-content {addBreakBtn.icon}"></span>
            <span class="sr-only">{addBreakBtn.tooltip}</span>
            to add a break
        </p>
    {/snippet}
    {#snippet row(item: ScheduleEntry, index: number, isSelected: boolean)}
        <div class="flex grow items-center gap-2">
            {#if item.isBreak}
                <span class="iconify text-lg lucide--coffee"></span>
                <div class="cursor-default font-semibold">Break</div>
            {:else}
                <Label.Root class="flex items-center text-lg" for={`num-images-${item.id}`}>
                    <span class="iconify lucide--image"></span>
                    <span class="sr-only">Number of images</span>
                </Label.Root>
                <div class="flex items-baseline gap-2">
                    <NumberField
                        id={`num-images-${item.id}`}
                        minValue={1}
                        maxValue={999}
                        bind:value={schedule[index].repeat}
                        bgColor={isSelected ? "primary" : "base"}
                    />
                    <div class="cursor-default text-xs">
                        {schedule[index].repeat === 1 ? "image" : "images"}
                    </div>
                </div>
            {/if}
        </div>
        <div>
            <DurationField
                bind:seconds={schedule[index].duration}
                inputStyle="small"
                bgColor={isSelected ? "primary" : "base"}
            />
        </div>
    {/snippet}
</ReorderableList>

<div class="flex justify-center gap-6 text-2xl font-semibold">
    <p>
        {scheduler.totalImgs}
        <span class="text-sm font-normal text-muted">
            total {scheduler.totalImgs === 1 ? "image" : "images"}
        </span>
    </p>
    <p>
        {prettyMilliseconds(scheduler.totalDuration * 1000)}
        <span class="text-sm font-normal text-muted">total duration</span>
    </p>
</div>
