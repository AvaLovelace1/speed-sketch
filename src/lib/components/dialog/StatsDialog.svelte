<script lang="ts">
    import { SvelteDate } from "svelte/reactivity";
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import Heatmap from "$lib/components/heatmap/Heatmap.svelte";
    import type { DateKey } from "$lib/date-key";
    import { formatDateKey, toDateKey, getYear } from "$lib/date-key";
    import { formatDuration } from "$lib/utils";
    import { Stats } from "$lib/store/stats.svelte";

    // e.g. "4 drawings, 40m", or "No drawings" when nothing was recorded
    function activitySummary(drawings: number, timeSpent: number): string {
        if (drawings === 0 && timeSpent === 0) return "No drawings";

        const parts = [`${drawings.toLocaleString()} drawing${drawings === 1 ? "" : "s"}`];
        if (timeSpent > 0) parts.push(formatDuration(timeSpent));
        return parts.join(", ");
    }

    export interface Props {
        stats: Stats;
        onOpen?: () => void;
        onClose?: () => void;
    }

    let { stats, onOpen = () => {}, onClose = () => {} }: Props = $props();

    // "today" is fixed for the component lifetime so it stays consistent while the dialog is open
    const today = toDateKey(new SvelteDate());
    const thisYear = getYear(today);

    // The calendar shows one whole year at a time
    let year = $state(thisYear);
    const firstYear = $derived(Math.min(stats.earliestYear ?? thisYear, thisYear));
    const yearStart = $derived(`${year}-01-01`);
    const yearEnd = $derived(`${year}-12-31`);
    const yearSummary = $derived.by(() => {
        const { drawings, timeSpent } = stats.totalsForYear(year);
        return `${activitySummary(drawings, timeSpent)}`;
    });
    const streaks = $derived(stats.computeStreaks(today));

    // e.g. "4 drawings, 40m on June 18, 2026"
    function activityLabel(date: DateKey): string {
        const summary = activitySummary(
            stats.dailyDrawings[date] ?? 0,
            stats.dailyTimeSpent[date] ?? 0,
        );
        return `${summary} on ${formatDateKey(date)}`;
    }

    const statCards = $derived([
        {
            title: "Total drawings completed",
            value: stats.totalDrawings.toLocaleString(),
            icon: "lucide--image",
            color: "text-primary",
        },
        {
            title: "Total time spent drawing",
            value: stats.totalTimeSpent === 0 ? "0s" : formatDuration(stats.totalTimeSpent),
            icon: "lucide--clock",
            color: "text-secondary",
        },
        {
            title: "Current daily streak",
            value: streaks.current.toLocaleString(),
            icon: "lucide--flame",
            color: "text-accent",
        },
        {
            title: "Longest daily streak",
            value: streaks.longest.toLocaleString(),
            icon: "lucide--trophy",
            color: "text-warning",
        },
    ]);

    const yearBtns = $derived([
        {
            name: "Previous year",
            icon: "lucide--chevron-left",
            step: -1,
            disabled: year <= firstYear,
        },
        {
            name: "Next year",
            icon: "lucide--chevron-right",
            step: 1,
            disabled: year >= thisYear,
        },
    ]);

    let dialog: Dialog;

    export function open() {
        dialog.open();
    }
</script>

<Dialog bind:this={dialog} title="Stats" {onOpen} {onClose}>
    <div>
        <div
            class="stats mb-6 w-full stats-vertical md:grid-cols-2 lg:stats-horizontal lg:grid-cols-none"
        >
            {#each statCards as { title, value, color, icon }, i (title)}
                <div
                    class={[
                        "stat lg:border-b-0",
                        i % 2 === 0 ? "md:border-e md:border-dashed md:border-current/10" : "",
                        i >= 2 ? "md:border-b-0" : "",
                    ]}
                >
                    <div class="stat-figure {color} self-end text-3xl">
                        <span class="iconify {icon}"></span>
                    </div>
                    <div class="stat-title text-muted">{title}</div>
                    <div class="stat-value {color}" data-testid={title}>{value}</div>
                </div>
            {/each}
        </div>

        <div class="mb-3 flex items-center gap-4">
            <div class="flex items-center gap-1">
                {#each yearBtns as { name, icon, step, disabled } (name)}
                    <button
                        type="button"
                        class="btn btn-square btn-ghost text-base btn-xs"
                        aria-label={name}
                        {disabled}
                        onclick={() => (year += step)}
                    >
                        <span class="iconify {icon}"></span>
                    </button>
                    {#if name === "Previous year"}
                        <span class="text-sm text-muted" data-testid="year">{year}</span>
                    {/if}
                {/each}
            </div>
            <p class="text-sm text-muted" data-testid="year summary">{yearSummary}</p>
        </div>

        <div class="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-none">
            <Heatmap
                startDate={yearStart}
                endDate={yearEnd}
                values={stats.dailyTimeSpent}
                label={activityLabel}
            />
        </div>
    </div>
</Dialog>
