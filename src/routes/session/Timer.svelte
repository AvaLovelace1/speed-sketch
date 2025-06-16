<!--
@component
A timer that displays a given time.
-->
<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import StatusAlert from './StatusAlert.svelte';
    import { formatTimeClock, formatTimeISO } from '$lib/utils.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        // Time displayed, in seconds
        time?: number;
        // If set, the alert will turn red when timeRemaining is <= criticalTime
        criticalTime?: number | null;
    }

    const { time = 0, criticalTime = 10, ...props }: Props = $props();
    const timerString = $derived(formatTimeClock(time));
    const durationString = $derived(formatTimeISO(time));
    const timeIsCritical = $derived(criticalTime !== null && time <= criticalTime);
</script>

<StatusAlert
    role="timer"
    aria-live="polite"
    {...props}
    class={['font-mono', { 'alert-error': timeIsCritical }, props.class]}
>
    <span class="iconify lucide--timer"></span>
    <time datetime={durationString}>{timerString}</time>
</StatusAlert>
