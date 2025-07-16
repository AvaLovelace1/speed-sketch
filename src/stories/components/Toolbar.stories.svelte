<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import Toolbar from "$lib/components/Toolbar.svelte";

    const { Story } = defineMeta({
        title: "Components/Toolbar",
        component: Toolbar,
        tags: ["autodocs"],
    });

    const prevBtn = {
        key: "prev",
        label: "Prev",
        icon: "lucide--arrow-left",
        action: () => {},
        hotkey: "ArrowLeft",
        class: "btn-primary",
        tooltip: "Previous image",
    };
    const nextBtn = {
        key: "next",
        label: "Next",
        icon: "lucide--arrow-right",
        action: () => {},
        hotkey: "ArrowRight",
        class: "btn-info",
        tooltip: "Next image",
    };
    const pauseBtn = $derived({
        key: "pause",
        label: "Pause",
        icon: "lucide--pause",
        action: () => {},
        hotkey: " ",
        class: "btn-warning",
        tooltip: "Pause",
    });
    const exitBtn = {
        key: "exit",
        label: "Exit",
        icon: "lucide--log-out",
        action: () => {},
        hotkey: "Escape",
        class: "btn-error",
        tooltip: "Exit session",
    };
    const tools = $derived([prevBtn, nextBtn, pauseBtn, exitBtn]);
</script>

<!-- A toolbar with a set of tools/actions and keyboard shortcuts. -->
<Story name="Toolbar" args={{ tools, includeTooltipProvider: true }} />
