<script lang="ts">
    import Toolbar from "../routes/session/Toolbar.svelte";
    import { Tooltip } from "bits-ui";

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
        class: "btn-primary",
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

<Tooltip.Provider>
    <Toolbar {tools} />
</Tooltip.Provider>
