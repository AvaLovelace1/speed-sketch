<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import { Tooltip } from "bits-ui";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import type { Tool, Props as ToolbarProps } from "$lib/components/Toolbar.svelte";
    import { expect, fn, clearAllMocks } from "storybook/test";

    const { Story } = defineMeta({
        title: "Components/Toolbar",
        component: Toolbar,
        tags: ["autodocs"],
        render: template,
        args: {
            tools: [
                {
                    uid: "tool-1",
                    tooltip: "Tool 1",
                    icon: "lucide--tally-1",
                    action: fn(),
                    hotkey: "1",
                },
                {
                    uid: "tool-2",
                    tooltip: "Tool 2",
                    icon: "lucide--tally-2",
                    action: fn(),
                    hotkey: "2",
                },
                {
                    uid: "tool-3",
                    tooltip: "Tool 3",
                    icon: "lucide--tally-3",
                    action: fn(),
                    hotkey: "3",
                    disabled: true,
                },
            ],
        },
    });
</script>

{#snippet template(args: ToolbarProps)}
    <Tooltip.Provider>
        <Toolbar {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- A toolbar with a set of tools/actions and keyboard shortcuts. -->
<Story name="Default" />

<!-- Actions can be triggered by clicking the buttons or using the hotkeys. Disabled tools have their hotkeys disabled. -->
<Story
    name="With Interactions"
    play={async ({ args, canvas, userEvent, step }) => {
        function clickTool(tool: Tool) {
            return step(`Click tool ${tool.uid}`, async () => {
                if (tool.disabled) return;
                await userEvent.click(canvas.getByRole("button", { name: tool.tooltip }));
                await expect(tool.action).toHaveBeenCalledOnce();
                clearAllMocks();
            });
        }

        function pressHotkey(tool: Tool) {
            return step(`Press hotkey for tool ${tool.uid}`, async () => {
                const hotkey = tool.hotkey || "";
                await userEvent.keyboard(`{${hotkey}}`);
                if (tool.disabled) await expect(tool.action).not.toHaveBeenCalled();
                else await expect(tool.action).toHaveBeenCalledOnce();
                clearAllMocks();
            });
        }

        for (const tool of args.tools) await clickTool(tool);
        for (const tool of args.tools) await pressHotkey(tool);
    }}
/>
