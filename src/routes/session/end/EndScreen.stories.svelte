<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { Tooltip } from "bits-ui";
    import EndScreen from "./EndScreen.svelte";
    import type { Props as EndScreenProps } from "./EndScreen.svelte";
    import { expect } from "storybook/test";
    import type { StoryContext } from "storybook/internal/types";

    const { Story } = defineMeta({
        title: "Screens/EndScreen",
        component: EndScreen,
        tags: ["autodocs"],
        render: template,
        args: {
            completedDrawings: 9001,
            timeSpent: 60 ** 2 + 30 * 60 + 15,
        },
    });

    async function expectStatCards(
        { canvas, step }: StoryContext,
        cards: { name: RegExp; content: RegExp }[],
    ) {
        await step("All stat cards are visible", async () => {
            for (const { name, content } of cards) {
                const stat = canvas.getByTestId(name);
                await expect(stat).toBeVisible();
                await expect(stat).toHaveTextContent(content);
            }
        });
    }
</script>

{#snippet template(args: EndScreenProps)}
    <Tooltip.Provider>
        <EndScreen {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- The screen displayed at the end of a session. -->
<Story
    name="Default"
    play={async (ctx) => {
        const { canvas, step } = ctx;
        await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();

        await expectStatCards(ctx, [
            { name: /completed/i, content: /^9,001$/ },
            { name: /time spent/i, content: /^1h 30m$/ },
        ]);

        await step("Buttons are enabled", async () => {
            for (const btnName of [/main menu/i, /settings/i, /stats/i]) {
                await expect(canvas.getByRole("button", { name: btnName })).toBeEnabled();
            }
        });
    }}
/>

<Story
    name="Zero Stats"
    args={{ completedDrawings: 0, timeSpent: 0 }}
    play={async (ctx) => {
        await expectStatCards(ctx, [
            { name: /completed/i, content: /^0$/ },
            { name: /time spent/i, content: /^0s$/ },
        ]);
    }}
/>
