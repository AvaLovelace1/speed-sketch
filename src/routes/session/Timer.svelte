<!--
@component
A timer that displays a given time.
-->
<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import StatusAlert from "./StatusAlert.svelte";
    import prettyMilliseconds from "pretty-ms";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        // Time displayed, in seconds
        time?: number;
        // If set, the alert will turn red when timeRemaining is <= criticalTime
        criticalTime?: number | null;
    }

    const { time = 0, criticalTime = 10, ...props }: Props = $props();
    const timerString = $derived(prettyMilliseconds(time * 1000, { colonNotation: true }));
    const durationString = $derived(prettyMilliseconds(time * 1000));
    const timeIsCritical = $derived(criticalTime !== null && time <= criticalTime);
</script>

<StatusAlert
    role="timer"
    aria-live="polite"
    {...props}
    class={["font-mono", { "alert-error": timeIsCritical }, props.class]}
>
    <span class="iconify lucide--timer"></span>
    <time datetime={durationString}>{timerString}</time>
</StatusAlert>
