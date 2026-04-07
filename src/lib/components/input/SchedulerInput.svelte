<script lang="ts">
    import NumberField from "$lib/components/input/NumberField.svelte";
    import DurationField from "$lib/components/input/DurationField.svelte";
    import { Scheduler } from "$lib/components/input/scheduler.svelte";
    import type { SessionSchedule } from "$lib/drawing-session.svelte";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import type { Tool } from "$lib/components/Toolbar.svelte";
    import prettyMilliseconds from "pretty-ms";
    import Sortable from "sortablejs";
    import type { Attachment } from "svelte/attachments";
    import { Button, Label } from "bits-ui";
    import { untrack } from "svelte";
    import { prefersReducedMotion } from "svelte/motion";
    import { getDuration } from "$lib/motion.svelte";
    import { isTauri } from "@tauri-apps/api/core";

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
        action: scheduler.removeEntry,
        tooltip: "Remove entry",
        disabled: schedule.length === 0,
    });
    const moveUpBtn: Tool = $derived({
        uid: "move-entry-up",
        icon: "lucide--arrow-up-from-line",
        action: scheduler.moveEntryUp,
        tooltip: "Move entry up",
        disabled: scheduler.selectedIdx <= 0,
    });
    const moveDownBtn: Tool = $derived({
        uid: "move-entry-down",
        icon: "lucide--arrow-down-from-line",
        action: scheduler.moveEntryDown,
        tooltip: "Move entry down",
        disabled: scheduler.selectedIdx >= schedule.length - 1,
    });
    const tools = $derived([addBtn, addBreakBtn, removeBtn, moveUpBtn, moveDownBtn]);

    let sortable: Sortable;

    const sortableAttachment: Attachment = (element) => {
        const node = element as HTMLElement;
        sortable = Sortable.create(node, {
            animation: prefersReducedMotion.current ? 0 : getDuration("medium"),
            handle: ".sortable-handle",
            forceFallback: isTauri(), // Tauri doesn't support Drag and Drop API
            onSort: (evt) => {
                const { oldIndex, newIndex } = evt;
                if (oldIndex === undefined || newIndex === undefined) return;
                scheduler.selectedIdx = oldIndex;
                if (oldIndex !== newIndex) scheduler.moveEntry(newIndex);
            },
        });
        return () => {
            sortable.destroy();
        };
    };
</script>

<table class="mb-3 block">
    <caption class="sr-only">Scheduler input</caption>
    <tbody
        {@attach sortableAttachment}
        class="list max-h-48 overflow-auto rounded-box bg-base-200 inset-shadow-xs"
    >
        {#if schedule.length === 0}
            <tr class="list-row flex justify-center text-center">
                <td class="p-3 text-xs text-muted">
                    Use
                    <span class="iconify align-middle text-base-content {addBtn.icon}"></span>
                    <span class="sr-only">{addBtn.tooltip}</span>
                    to add a drawing interval
                    <br />
                    or
                    <span class="iconify align-middle text-base-content {addBreakBtn.icon}"></span>
                    <span class="sr-only">{addBreakBtn.tooltip}</span>
                    to add a break
                </td>
            </tr>
        {/if}
        <!-- Key on both id and idx to prevent issues with Sortable -->
        {#each schedule as { id }, i (id + i.toString())}
            <tr
                class="group list-row flex items-center text-muted transition-[background-color]
                       duration-(--daisyui-btn-duration) ease-(--daisyui-btn-ease)
                       hover:bg-base-300 aria-selected:bg-primary aria-selected:text-primary-content"
                aria-selected={i === scheduler.selectedIdx}
                onclick={() => (scheduler.selectedIdx = i)}
                onfocusin={() => (scheduler.selectedIdx = i)}
                onkeydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        scheduler.selectedIdx = i;
                        e.preventDefault();
                    }
                }}
            >
                <td>
                    <Button.Root
                        class="sortable-handle flex cursor-grab items-center py-3
                               text-base text-stroke group-aria-selected:text-primary-content"
                        onmousedown={() => (scheduler.selectedIdx = i)}
                        type="button"
                    >
                        <span class="iconify lucide--grip-vertical"></span>
                        <span class="sr-only">Drag to reorder</span>
                    </Button.Root>
                </td>
                <td class="grow">
                    <div class="flex items-center gap-2">
                        {#if schedule[i].isBreak}
                            <span class="iconify text-lg lucide--coffee"></span>
                            <div class="cursor-default font-semibold">Break</div>
                        {:else}
                            <Label.Root class="flex items-center text-lg" for={`num-images-${id}`}>
                                <span class="iconify lucide--image"></span>
                                <span class="sr-only">Number of images</span>
                            </Label.Root>
                            <div class="flex items-baseline gap-2">
                                <NumberField
                                    id={`num-images-${id}`}
                                    minValue={1}
                                    maxValue={999}
                                    bind:value={schedule[i].repeat}
                                    bgColor={i === scheduler.selectedIdx ? "primary" : "base"}
                                />
                                <div class="cursor-default text-xs">
                                    {schedule[i].repeat === 1 ? "image" : "images"}
                                </div>
                            </div>
                        {/if}
                    </div>
                </td>
                <td>
                    <DurationField
                        bind:seconds={schedule[i].duration}
                        inputStyle="small"
                        bgColor={i === scheduler.selectedIdx ? "primary" : "base"}
                    />
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<Toolbar {tools} class="mb-6" toolbarStyle="small" />

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
