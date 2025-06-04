<script lang="ts">
    import {Timer} from '@lucide/svelte'
    import StatusAlert from './StatusAlert.svelte';

    interface Props {
        // Time displayed, in seconds
        time?: number;
        // If set, the alert will turn red when timeRemaining is <= criticalTime
        criticalTime?: number | null;

        [key: string]: any;
    }

    let {time = 0, criticalTime = 10, ...props}: Props = $props();

    let negative = $derived(time < 0);
    let hrs = $derived(Math.floor(Math.abs(time) / 60 / 60));
    let mins = $derived((Math.floor(Math.abs(time) / 60) % 60));
    let minsFmt = $derived(hrs ? mins.toString().padStart(2, '0') : mins);
    let secs = $derived(Math.floor(Math.abs(time) % 60));
    let secsFmt = $derived(secs.toString().padStart(2, '0'));
    let timerString = $derived(`${negative ? '-' : ''}${hrs ? hrs + ':' : ''}${minsFmt}:${secsFmt}`);
    let timeIsCritical = $derived(criticalTime !== null && time <= criticalTime);
</script>

<StatusAlert role="timer" aria-live="polite" {...props} class={[{'alert-error': timeIsCritical}, props.class]}>
    <Timer size={20}/>{timerString}
</StatusAlert>
