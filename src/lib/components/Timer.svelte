<script lang="ts">
    import {Timer} from '@lucide/svelte'
    import StatusAlert from '$lib/components/StatusAlert.svelte';

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

<StatusAlert alertClass={'font-mono' + (timeIsCritical ? ' alert-error' : '')}>
    <Timer size={20}/>
    <span role="timer" aria-live="polite">{timerString}</span>
</StatusAlert>
