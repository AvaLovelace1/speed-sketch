<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import StatusAlert from './StatusAlert.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        // Time displayed, in seconds
        time?: number;
        // If set, the alert will turn red when timeRemaining is <= criticalTime
        criticalTime?: number | null;
    }

    let { time = 0, criticalTime = 10, ...props }: Props = $props();

    let timerString = $derived.by(() => {
        let negative = time < 0;
        let hrs = Math.floor(Math.abs(time) / 60 / 60);
        let mins = Math.floor(Math.abs(time) / 60) % 60;
        let minsFmt = hrs > 0 && mins < 10 ? `0${mins}` : mins;
        let secs = Math.floor(Math.abs(time) % 60);
        let secsFmt = secs < 10 ? `0${secs}` : secs;
        return `${negative ? '-' : ''}${hrs ? hrs + ':' : ''}${minsFmt}:${secsFmt}`;
    });
    let timeIsCritical = $derived(criticalTime !== null && time <= criticalTime);
</script>

<StatusAlert
    role="timer"
    aria-live="polite"
    {...props}
    class={[{ 'alert-error': timeIsCritical }, props.class]}
>
    <span class="iconify lucide--timer"></span>{timerString}
</StatusAlert>
