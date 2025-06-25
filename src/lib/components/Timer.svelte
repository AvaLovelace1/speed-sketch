<!--
@component
A timer that displays a given time.
-->
<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { Progress } from "bits-ui";
    import StatusAlert from "$lib/components/StatusAlert.svelte";
    import prettyMilliseconds from "pretty-ms";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        // Unique ID for the label element
        label: string;
        // Time displayed, in seconds
        time?: number;
        // If set, the alert will turn red when timeRemaining is <= criticalTime
        criticalTime?: number | null;
        // Maximum time used for the radial progress bar
        maxTime?: number;
    }

    const { label, time = 0, criticalTime = 10, maxTime = 60, ...props }: Props = $props();

    const timerString = $derived(prettyMilliseconds(time * 1000, { colonNotation: true }));
    const durationString = $derived(prettyMilliseconds(time * 1000));
    const timeIsCritical = $derived(criticalTime !== null && time <= criticalTime);
    const progressValue = $derived(Math.min(Math.round((time / maxTime) * 100), 100));
</script>

<StatusAlert
    role="timer"
    aria-live="polite"
    {...props}
    class={["tabular-nums", { "alert-error": timeIsCritical }, props.class]}
>
    <Progress.Root
        class="radial-progress"
        style="--value:{progressValue}; --size:1em; --thickness:2px;"
        value={progressValue}
        max={100}
    />
    <span class="sr-only">{label}</span>
    <time datetime={durationString}>{timerString}</time>
</StatusAlert>
