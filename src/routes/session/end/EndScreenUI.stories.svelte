<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { Tooltip } from "bits-ui";
    import EndScreenUI from "./EndScreenUI.svelte";
    import type { Props as EndScreenUIProps } from "./EndScreenUI.svelte";

    const { Story } = defineMeta({
        title: "Pages/EndScreenUI",
        component: EndScreenUI,
        tags: ["autodocs"],
        render: template,
        args: {
            nCompletedImgs: 42,
            timeSpent: 60 ** 2 + 30 * 60 + 15,
        },
    });
</script>

{#snippet template(args: EndScreenUIProps)}
    <Tooltip.Provider>
        <EndScreenUI {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- The screen displayed at the end of a session. -->
<Story name="EndScreenUI" />
