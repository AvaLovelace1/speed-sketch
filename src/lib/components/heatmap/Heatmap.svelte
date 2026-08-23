<!--
@component
A calendar of daily activity.
The calendar is a single tab stop: tabbing in lands on the first day,
and the arrow keys move from there.
-->
<script lang="ts">
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { formatDateKey, type DateKey } from "$lib/date-key";
    import { buildCalendar, DAYS_PER_WEEK, shadingLevels } from "./heatmap";

    const WEEKDAYS = [
        { label: "Mon", row: 2 },
        { label: "Wed", row: 4 },
        { label: "Fri", row: 6 },
    ];

    const TILE_CLASS = "aspect-square rounded-xs w-3";
    const SHADING_LEVEL_CLASS = [
        "bg-base-content/10",
        "bg-primary/30",
        "bg-primary/50",
        "bg-primary/75",
        "bg-primary",
    ];
    const LABEL_CLASS = "text-xs leading-none text-muted";
    const ROW_HEIGHT = "16px"; // height of each calendar row, to align the day labels

    export interface Props {
        /** First day shown, as "YYYY-MM-DD". Inclusive. */
        startDate: DateKey;
        /** Last day shown, as "YYYY-MM-DD". Inclusive. */
        endDate: DateKey;
        /** How much activity each day saw. Days not listed count as none. */
        values?: Record<DateKey, number>;
        /** Tooltip and accessible label for a day. */
        label?: (date: DateKey, value: number) => string;
    }

    const {
        startDate,
        endDate,
        values = {},
        label = (date, value) => `${value} on ${formatDateKey(date)}`,
    }: Props = $props();

    const calendar = $derived(buildCalendar(startDate, endDate));
    const levels = $derived(shadingLevels(Object.values(values)));
    const lastDay = $derived(calendar.days.length - 1);

    let scroller: HTMLElement | undefined = $state();
    let activeTile = $state<{ tile: HTMLElement; text: string } | null>(null);
    let _focusedDay = $state(0);
    // clamped so a shrinking date range can't strand the tab stop past the end
    const focusedDay = $derived(Math.min(_focusedDay, lastDay));

    function focusDay(index: number) {
        _focusedDay = Math.min(Math.max(index, 0), lastDay);
        scroller?.querySelectorAll("button")[_focusedDay]?.focus();
    }

    const ARROW_STEPS: Record<string, number> = {
        ArrowLeft: -DAYS_PER_WEEK,
        ArrowRight: DAYS_PER_WEEK,
        ArrowUp: -1,
        ArrowDown: 1,
    };

    function onkeydown(event: KeyboardEvent) {
        if (event.key === "Home") focusDay(0);
        else if (event.key === "End") focusDay(lastDay);
        else if (event.key in ARROW_STEPS) focusDay(focusedDay + ARROW_STEPS[event.key]);
        else return;
        event.preventDefault();
    }
</script>

<div>
    <div class="mb-2 flex items-center" role="group" aria-label="Activity calendar">
        <div
            class="grid items-center"
            style:grid-template-columns="max-content"
            style:grid-template-rows="repeat(8, {ROW_HEIGHT})"
        >
            {#each WEEKDAYS as { label, row } (label)}
                <div class="col-start-1 pe-2 {LABEL_CLASS}" style:grid-row={row + 1}>
                    {label}
                </div>
            {/each}
        </div>

        <div
            bind:this={scroller}
            class="grid items-center overflow-x-auto"
            style:grid-template-columns="repeat({calendar.weeks}, max-content)"
            style:grid-template-rows="repeat(8, {ROW_HEIGHT})"
            data-testid="scroller"
        >
            {#each calendar.months as { key, label, column, span } (key)}
                <div class={["mb-0.5", LABEL_CLASS]} style:grid-column="{column} / span {span}">
                    {label}
                </div>
            {/each}

            {#each calendar.days as { key, column, row }, index (key)}
                {@const value = values[key] ?? 0}
                {@const level = levels.get(value) ?? 0}
                {@const text = label(key, value)}
                <!-- Leave a margin around each button so outline doesn't get cut off -->
                <button
                    type="button"
                    class={[
                        "m-0.5 hover:outline-1 hover:outline-muted focus-visible:outline-2 focus-visible:outline-primary",
                        TILE_CLASS,
                        SHADING_LEVEL_CLASS[level],
                    ]}
                    aria-label={text}
                    data-level={level}
                    tabindex={index === focusedDay ? 0 : -1}
                    {onkeydown}
                    onpointerenter={(event) => (activeTile = { tile: event.currentTarget, text })}
                    onfocus={(event) => (activeTile = { tile: event.currentTarget, text })}
                    onpointerleave={() => (activeTile = null)}
                    onblur={() => (activeTile = null)}
                    style:grid-column={column}
                    style:grid-row={row + 1}
                ></button>
            {/each}
        </div>
    </div>

    <!-- All days share one tooltip that moves between them. -->
    <Tooltip side="top" anchor={activeTile?.tile ?? null}>
        {#snippet tooltipContent()}{activeTile?.text}{/snippet}
    </Tooltip>

    <div class="flex items-center justify-end gap-1 {LABEL_CLASS}">
        <span class="me-1">Less</span>
        {#each [...SHADING_LEVEL_CLASS.keys()] as level (level)}
            <span class={[TILE_CLASS, SHADING_LEVEL_CLASS[level]]} data-level={level}></span>
        {/each}
        <span class="ms-1">More</span>
    </div>
</div>
