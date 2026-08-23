<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { Tooltip as BitsTooltip } from "bits-ui";
    import StatsDialog from "./StatsDialog.svelte";
    import type { Props as StatsDialogProps } from "./StatsDialog.svelte";
    import { Stats } from "$lib/store/stats.svelte";
    import { addDays, daysBetween, formatDateKey, toDateKey } from "$lib/date-key";
    import { SvelteDate } from "svelte/reactivity";
    import {
        clearAllMocks,
        expect,
        fn,
        screen,
        waitFor,
        waitForElementToBeRemoved,
        within,
    } from "storybook/test";
    import type { StoryContext } from "storybook/internal/types";

    const daysInYear = (year: number) => daysBetween(`${year}-01-01`, `${year}-12-31`) + 1;

    const today = new SvelteDate();
    const todayKey = toDateKey(today);
    const thisYear = today.getFullYear();
    const lastYear = thisYear - 1;

    function sampleActivity() {
        const dailyDrawings: Record<string, number> = {};
        const dailyTimeSpent: Record<string, number> = {};
        const put = (offset: number, timeSpent: number, drawings: number) => {
            const key = addDays(todayKey, offset);
            dailyDrawings[key] = drawings;
            dailyTimeSpent[key] = timeSpent;
        };
        // Current streak of 3 days ending today
        put(0, 30 * 60 + 1, 10);
        put(-1, 45 * 60, 20);
        put(-2, 15 * 60, 31);
        // Longest streak of 5 days, a few weeks back
        for (let i = 14; i < 19; i++) put(-i, 20 * 60, 200);
        return { dailyDrawings, dailyTimeSpent };
    }

    const sampleActivityTwoYears = () => ({
        dailyDrawings: { [`${lastYear}-03-04`]: 5, [todayKey]: 10 },
        dailyTimeSpent: { [`${lastYear}-03-04`]: 600, [todayKey]: 30 * 60 + 1 },
    });

    const { Story } = defineMeta({
        title: "Components/Dialog/StatsDialog",
        component: StatsDialog,
        tags: ["autodocs"],
        render: template,
        args: {
            stats: new Stats(sampleActivity()),
            onOpen: fn(),
            onClose: fn(),
        },
    });

    let statsDialog: StatsDialog;

    async function openDialog({ args, canvas, userEvent, step }: StoryContext) {
        await step("Open dialog", async () => {
            await userEvent.click(canvas.getByRole("button", { name: /open/i }));
            await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
            await waitFor(() => expect(args.onOpen).toHaveBeenCalledOnce());
            clearAllMocks();
        });
    }

    async function closeDialog({ args, userEvent, step }: StoryContext) {
        await step("Close dialog", async () => {
            const dialogCanvas = within(screen.getByRole("dialog"));
            await userEvent.click(dialogCanvas.getByRole("button", { name: /close/i }));
            await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
            await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
            clearAllMocks();
        });
    }

    async function expectStatCards(
        { step }: StoryContext,
        cards: { name: RegExp; content: RegExp }[],
    ) {
        await step("All stat cards are visible", async () => {
            const dialogCanvas = within(screen.getByRole("dialog"));
            for (const { name, content } of cards) {
                const stat = dialogCanvas.getByTestId(name);
                await expect(stat).toBeVisible();
                await expect(stat).toHaveTextContent(content);
            }
        });
    }

    async function expectHeatmap({ step }: StoryContext, todayLabel: string) {
        await step(`Calendar covers all of ${thisYear}`, async () => {
            const heatmapTiles = within(screen.getByRole("dialog")).getAllByRole("button", {
                name: /drawing/i,
            });
            await expect(heatmapTiles).toHaveLength(daysInYear(thisYear));
            const dialogCanvas = within(screen.getByRole("dialog"));
            await expect(dialogCanvas.getByRole("button", { name: todayLabel })).toBeVisible();
        });
    }

    async function expectYear({ step }: StoryContext, expected: number) {
        await step(`Current year shows ${expected}`, async () => {
            const year = within(screen.getByRole("dialog")).getByTestId("year");
            await expect(year).toHaveTextContent(new RegExp(`^${expected}$`));
        });
    }

    async function expectYearSummary({ step }: StoryContext, expected: string | RegExp) {
        await step(`Year summary reads "${expected}"`, async () => {
            const yearSummary = within(screen.getByRole("dialog")).getByTestId("year summary");
            await expect(yearSummary).toHaveTextContent(expected);
        });
    }

    async function expectYearNavBounded({ step }: StoryContext) {
        await step("Year navigation stops at the recorded activity", async () => {
            const dialogCanvas = within(screen.getByRole("dialog"));
            await expect(
                dialogCanvas.getByRole("button", { name: /previous year/i }),
            ).toBeDisabled();
            await expect(dialogCanvas.getByRole("button", { name: /next year/i })).toBeDisabled();
        });
    }

    async function expectHeatmapTooltip({ userEvent, step }: StoryContext, label: string) {
        await step("Hovering a day shows its tooltip", async () => {
            const dialogCanvas = within(screen.getByRole("dialog"));
            await userEvent.hover(dialogCanvas.getByRole("button", { name: label }));
            const tooltip = await screen.findByRole("tooltip");
            await waitFor(() => expect(tooltip).toBeVisible());
            await waitFor(() => expect(tooltip).toHaveTextContent(label));

            // Tooltip is above the dialog
            const { left, top, width, height } = tooltip.getBoundingClientRect();
            const onTop = document.elementFromPoint(left + width / 2, top + height / 2);
            await expect(tooltip.contains(onTop)).toBe(true);
        });
    }
</script>

{#snippet template(args: StatsDialogProps)}
    <BitsTooltip.Provider>
        <button class="btn" onclick={() => statsDialog.open()}>Open StatsDialog</button>
        <StatsDialog bind:this={statsDialog} {...args} />
    </BitsTooltip.Provider>
{/snippet}

<!-- Global stats dialog: all-time totals, daily streaks, and an activity heatmap. -->
<Story
    name="Default"
    play={async (ctx) => {
        await openDialog(ctx);
        const dialogCanvas = within(screen.getByRole("dialog"));

        await expect(dialogCanvas.getByRole("heading", { level: 2 })).toBeVisible();

        await expectStatCards(ctx, [
            { name: /completed/i, content: /^1,061$/ },
            { name: /time spent/i, content: /^3h 10m$/ },
            { name: /current/i, content: /^3$/ },
            { name: /longest/i, content: /^5$/ },
        ]);

        const todayLabel = `10 drawings, 30m 1s on ${formatDateKey(todayKey)}`;
        await expectHeatmap(ctx, todayLabel);
        await expectYear(ctx, thisYear);
        await expectYearSummary(ctx, /^1,061 drawings, 3h 10m$/);
        await expectYearNavBounded(ctx);
        await expectHeatmapTooltip(ctx, todayLabel);

        await closeDialog(ctx);
    }}
/>

<!-- With no recorded sessions, all stats read zero and the heatmap is empty. -->
<Story
    name="Empty"
    args={{ stats: new Stats() }}
    play={async (ctx) => {
        await openDialog(ctx);
        await expectStatCards(ctx, [
            { name: /completed/i, content: /^0$/ },
            { name: /time spent/i, content: /^0s$/ },
            { name: /current/i, content: /^0$/ },
            { name: /longest/i, content: /^0$/ },
        ]);
        await expectHeatmap(ctx, `No drawings on ${formatDateKey(todayKey)}`);
        await expectYear(ctx, thisYear);
        await expectYearSummary(ctx, /^No drawings$/);
        await expectYearNavBounded(ctx);
        await closeDialog(ctx);
    }}
/>

<!-- There must be enough room for very large numbers. -->
<Story
    name="Big Numbers"
    args={{
        stats: new Stats({
            dailyDrawings: { [todayKey]: 1234567 },
            dailyTimeSpent: { [todayKey]: 123456789 },
        }),
    }}
    play={async (ctx) => {
        await openDialog(ctx);
        await expectStatCards(ctx, [
            { name: /completed/i, content: /^1,234,567$/ },
            { name: /time spent/i, content: /^3y 333d$/ },
            { name: /current/i, content: /^1$/ },
            { name: /longest/i, content: /^1$/ },
        ]);
        await closeDialog(ctx);
    }}
/>

<!-- Below `lg` the calendar is too wide for the dialog, so it scrolls sideways. -->
<Story
    name="Narrow"
    parameters={{ viewport: { defaultViewport: "mobile2" } }}
    play={async (ctx) => {
        await openDialog(ctx);
        const dialog = screen.getByRole("dialog");
        const scroller = within(dialog).getByTestId("scroller");

        await ctx.step("Dialog fits the viewport", async () => {
            await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(
                window.innerWidth,
            );
        });

        await ctx.step("Calendar scrolls instead of widening the dialog", async () => {
            await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
        });

        await closeDialog(ctx);
    }}
/>

<!-- With activity in more than one year, the calendar can be paged back and forth. -->
<Story
    name="Multiple Years"
    args={{ stats: new Stats(sampleActivityTwoYears()) }}
    play={async (ctx) => {
        await openDialog(ctx);
        const dialogCanvas = within(screen.getByRole("dialog"));
        const previous = dialogCanvas.getByRole("button", { name: /previous year/i });
        const next = dialogCanvas.getByRole("button", { name: /next year/i });

        async function expectThisYear() {
            await expectHeatmap(ctx, `10 drawings, 30m 1s on ${formatDateKey(todayKey)}`);
            await expectYear(ctx, thisYear);
            await expectYearSummary(ctx, /^10 drawings, 30m 1s$/);
        }

        async function expectLastYear() {
            await expectHeatmap(ctx, `5 drawings, 10m on ${formatDateKey(`${lastYear}-03-04`)}`);
            await expectYear(ctx, lastYear);
            await expectYearSummary(ctx, /^5 drawings, 10m$/);
        }

        await ctx.step("The latest year is as far forward as it goes", async () => {
            await expectThisYear();
            await expect(next).toBeDisabled();
            await expect(previous).toBeEnabled();
        });

        await ctx.step("Stepping back shows the earlier year", async () => {
            await ctx.userEvent.click(previous);
            await expectLastYear();
            await expect(previous).toBeDisabled();
            await expect(next).toBeEnabled();
        });

        await ctx.step("Stepping forward returns to this year", async () => {
            await ctx.userEvent.click(next);
            await expectThisYear();
        });

        await closeDialog(ctx);
    }}
/>
