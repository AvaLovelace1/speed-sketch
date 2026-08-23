<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { Tooltip as BitsTooltip } from "bits-ui";
    import Heatmap from "./Heatmap.svelte";
    import type { Props as HeatmapProps } from "./Heatmap.svelte";
    import { addDays, formatDateKey, type DateKey } from "$lib/date-key";
    import { expect, screen, waitFor, within } from "storybook/test";

    const START = "2026-01-01";
    const END = "2026-03-31";
    const DAYS_IN_RANGE = 90;
    const VALUES: Record<DateKey, number> = {
        "2026-01-05": 10,
        "2026-01-06": 20,
        "2026-02-14": 30,
        "2026-03-01": 40,
    };

    const label = (date: DateKey, value: number) =>
        value > 0
            ? `${value} minutes on ${formatDateKey(date)}`
            : `Nothing on ${formatDateKey(date)}`;

    function yearOfActivity(end: DateKey) {
        const values: Record<DateKey, number> = {};
        for (let offset = 0; offset < 365; offset++) {
            const date = addDays(end, -offset);
            const noise = (offset * 37) % 11;
            if (noise < (offset < 120 ? 3 : 7)) continue;
            values[date] = (noise + 1) * (offset < 120 ? 15 : 5) * 60;
        }
        return values;
    }

    const { Story } = defineMeta({
        title: "Components/Heatmap",
        component: Heatmap,
        tags: ["autodocs"],
        render: template,
        args: { startDate: START, endDate: END, values: VALUES, label },
        parameters: {
            a11y: {
                config: {
                    // Transitions interfere with color contrast checks
                    rules: [{ id: "color-contrast", enabled: false }],
                },
            },
        },
    });

    function tiles(canvas: ReturnType<typeof within>): HTMLElement[] {
        return canvas.getAllByRole("button");
    }
</script>

{#snippet template(args: HeatmapProps)}
    <BitsTooltip.Provider>
        <div class="bg-base-100 p-4">
            <Heatmap {...args} />
        </div>
    </BitsTooltip.Provider>
{/snippet}

<!-- A calendar of daily activity: one tile per day, shaded by how much happened. -->
<Story
    name="Default"
    play={async ({ canvas, step }) => {
        await step("One tile per day in the range", async () => {
            await expect(tiles(canvas)).toHaveLength(DAYS_IN_RANGE);
        });

        await step("Months and weekdays are labelled", async () => {
            for (const name of ["Jan", "Feb", "Mar", "Mon", "Wed", "Fri"]) {
                await expect(canvas.getByText(name)).toBeVisible();
            }
        });

        await step("Shading legend is visible", async () => {
            await expect(canvas.getByText("Less")).toBeVisible();
            await expect(canvas.getByText("More")).toBeVisible();
        });

        await step("Active days are shaded by rank", async () => {
            const levels = { "2026-01-05": 1, "2026-01-06": 2, "2026-02-14": 3, "2026-03-01": 4 };
            for (const [date, level] of Object.entries(levels)) {
                const tile = canvas.getByRole("button", { name: label(date, VALUES[date]) });
                await expect(tile).toHaveAttribute("data-level", String(level));
            }
        });

        await step("Every other day is empty", async () => {
            const empty = tiles(canvas).filter((tile) => tile.getAttribute("data-level") === "0");
            await expect(empty).toHaveLength(DAYS_IN_RANGE - Object.keys(VALUES).length);
        });
    }}
/>

<!-- With no activity at all, every tile stays empty. -->
<Story
    name="Empty"
    args={{ values: {} }}
    play={async ({ canvas, step }) => {
        await step("No day is shaded", async () => {
            for (const tile of tiles(canvas)) {
                await expect(tile).toHaveAttribute("data-level", "0");
            }
        });
    }}
/>

<!-- A single week. -->
<Story
    name="Partial Week"
    args={{
        startDate: "2026-06-18",
        endDate: "2026-06-24",
        values: { "2026-06-18": 40, "2026-06-21": 90 },
    }}
    play={async ({ canvas, step }) => {
        await step("Only the days in range are rendered", async () => {
            await expect(tiles(canvas)).toHaveLength(7);
        });

        await step("The month label spans both week columns", async () => {
            await expect(canvas.getByText("Jun")).toHaveStyle({ gridColumn: "1 / span 2" });
        });
    }}
/>

<!-- A whole calendar year. -->
<Story
    name="Full Year"
    args={{
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        values: yearOfActivity("2026-12-31"),
    }}
    play={async ({ canvas, step }) => {
        await step("A year of tiles is rendered", async () => {
            await expect(tiles(canvas)).toHaveLength(365);
        });
    }}
/>

<!-- The calendar scrolls sideways on small screens. -->
<Story
    name="Narrow"
    args={{
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        values: yearOfActivity("2026-12-31"),
    }}
    parameters={{ viewport: { defaultViewport: "mobile2" } }}
    play={async ({ canvas, step }) => {
        const scroller = canvas.getByTestId("scroller");

        await step("Calendar scrolls sideways", async () => {
            await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
        });

        await step("Scroll starts at position 0", async () => {
            await expect(scroller.scrollLeft).toBe(0);
        });

        await step("Tiles and months are in the scroller", async () => {
            await expect(scroller.querySelectorAll("button")).toHaveLength(365);
            await expect(within(scroller).getByText("Jan")).toBeVisible();
        });

        await step("Days and legend are not in the scroller", async () => {
            await expect(within(scroller).queryByText("Mon")).toBeNull();
            await expect(within(scroller).queryByText("Less")).toBeNull();
        });
    }}
/>

<!-- Hovering/focusing a day shows what happened on it. -->
<Story
    name="With Interactions"
    play={async ({ canvas, userEvent, step }) => {
        const expectTooltip = async (date: DateKey) => {
            const tooltip = await screen.findByRole("tooltip");
            await waitFor(() => expect(tooltip).toBeVisible());
            await waitFor(() => expect(tooltip).toHaveTextContent(label(date, VALUES[date] ?? 0)));
            await expect(screen.getAllByRole("tooltip")).toHaveLength(1);
        };

        const expectFocused = async (date: DateKey) => {
            expect(
                canvas.getByRole("button", { name: label(date, VALUES[date] ?? 0) }),
            ).toHaveFocus();
            await expectTooltip(date);
        };

        await step("Hover a day to show its tooltip", async () => {
            const text = label("2026-01-06", VALUES["2026-01-06"]);
            await userEvent.hover(canvas.getByRole("button", { name: text }));
            await expectTooltip("2026-01-06");
        });

        await step("The same tooltip moves to the next day hovered", async () => {
            const newText = label("2026-01-07", 0);
            await userEvent.hover(canvas.getByRole("button", { name: newText }));
            await expectTooltip("2026-01-07");
        });

        await step("Moving off the calendar hides the tooltip", async () => {
            await userEvent.unhover(canvas.getByRole("button", { name: label("2026-01-07", 0) }));
            await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
        });

        await step("Tabbing in lands on the first day", async () => {
            await expect(tiles(canvas).filter((tile) => tile.tabIndex === 0)).toHaveLength(1);
            await userEvent.tab();
            await expectFocused(START);
        });

        await step("Left and right step by a week, up and down by a day", async () => {
            await userEvent.keyboard("{ArrowRight}");
            await expectFocused("2026-01-08");
            await userEvent.keyboard("{ArrowDown}");
            await expectFocused("2026-01-09");
            await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
            await expectFocused(START);
        });

        await step("Focus stops at the ends of the range", async () => {
            await userEvent.keyboard("{ArrowLeft}");
            await expectFocused(START);
            await userEvent.keyboard("{End}");
            await expectFocused(END);
            await userEvent.keyboard("{ArrowRight}");
            await expectFocused(END);
            await userEvent.keyboard("{Home}");
            await expectFocused(START);
        });
    }}
/>
