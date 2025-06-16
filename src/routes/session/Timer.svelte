<!--
@component
A timer that displays a given time.
-->
<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import StatusAlert from './StatusAlert.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        // Time displayed, in seconds
        time?: number;
        // If set, the alert will turn red when timeRemaining is <= criticalTime
        criticalTime?: number | null;
    }

    const { time = 0, criticalTime = 10, ...props }: Props = $props();

    const hrs = $derived.by(() => Math.floor(Math.abs(time) / 60 / 60));
    const mins = $derived.by(() => Math.floor(Math.abs(time) / 60) % 60);
    const secs = $derived.by(() => Math.floor(Math.abs(time) % 60));

    const timerString = $derived.by(() => {
        const negative = time < 0;
        const minsFmt = hrs > 0 && mins < 10 ? `0${mins}` : mins;
        const secsFmt = secs < 10 ? `0${secs}` : secs;
        return `${negative ? '-' : ''}${hrs ? hrs + ':' : ''}${minsFmt}:${secsFmt}`;
    });
    const durationString = $derived(`PT${hrs}H${mins}M${secs}S`);
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
