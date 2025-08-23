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
    import { Button } from "bits-ui";
    import { prefersReducedMotion } from "svelte/motion";
    import { getDuration } from "$lib/motion.svelte";

    export interface Props {
        schedule?: SessionSchedule;
    }

    const { schedule = $bindable([]) }: Props = $props();
    const scheduler = new Scheduler(schedule);

    const addBtn: Tool = {
        uid: "add-entry",
        icon: "lucide--plus",
        action: () => scheduler.addEntry(),
        tooltip: "Add entry",
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
    const tools = $derived([addBtn, removeBtn, moveUpBtn, moveDownBtn]);

    let sortable: Sortable;

    const sortableAttachment: Attachment = (element) => {
        const node = element as HTMLElement;
        sortable = Sortable.create(node, {
            animation: prefersReducedMotion.current ? 0 : getDuration("medium"),
            handle: ".sortable-handle",
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
    <caption class="mb-2 cursor-default text-start text-sm text-muted">Schedule</caption>
    <tbody
        {@attach sortableAttachment}
        class="list max-h-48 overflow-auto rounded-box bg-base-200 inset-shadow-xs"
    >
        {#if schedule.length === 0}
            <tr class="list-row flex justify-center">
                <td class="p-3 text-xs text-muted">
                    Add an entry with the
                    <span class="iconify align-middle text-base-content lucide--plus"></span>
                    <span class="sr-only">Add entry</span>
                    button
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
                    >
                        <span class="iconify lucide--grip-vertical"></span>
                        <span class="sr-only">Drag to reorder</span>
                    </Button.Root>
                </td>
                <td class="grow">
                    <NumberField
                        id={`num-images-${id}`}
                        bind:value={schedule[i].repeat}
                        bgColor={i === scheduler.selectedIdx ? "primary" : "base"}
                    />
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
