<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { Tooltip } from "bits-ui";
    import EndScreen from "./EndScreen.svelte";
    import type { Props as EndScreenProps } from "./EndScreen.svelte";

    const { Story } = defineMeta({
        title: "Screens/EndScreen",
        component: EndScreen,
        tags: ["autodocs"],
        render: template,
        args: {
            nCompletedImgs: 42,
            timeSpent: 60 ** 2 + 30 * 60 + 15,
        },
    });
</script>

{#snippet template(args: EndScreenProps)}
    <Tooltip.Provider>
        <EndScreen {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- The screen displayed at the end of a session. -->
<Story name="Default" />
