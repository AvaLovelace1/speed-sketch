<script lang="ts">
    interface Props {
        time?: number; // in seconds
        criticalTime?: number | null; // if set, the alert will turn red when timeRemaining is <= criticalTime
    }

    let {time = 0, criticalTime = 10}: Props = $props();
    let negative = $derived(time < 0);
    let hrs = $derived(Math.floor(Math.abs(time) / 60 / 60));
    let mins = $derived((Math.floor(Math.abs(time) / 60) % 60));
    let minsFmt = $derived(hrs ? mins.toString().padStart(2, '0') : mins);
    let secs = $derived(Math.floor(Math.abs(time) % 60));
    let secsFmt = $derived(secs.toString().padStart(2, '0'));
    let timerString = $derived(`${negative ? '-' : ''}${hrs ? hrs + ':' : ''}${minsFmt}:${secsFmt}`);
    let timeIsCritical = $derived(criticalTime !== null && time <= criticalTime);
</script>

<div
    class="alert alert-soft {timeIsCritical ? 'alert-error' : ''} font-mono shadow-sm p-2 flex"
    role="timer" aria-live="polite">
    ⏲ {timerString}
</div>