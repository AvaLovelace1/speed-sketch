<!--
@component
A field that allows the user to input a time duration.
-->
<script lang="ts">
    import { TimeField } from "bits-ui";
    import { Time } from "@internationalized/date";

    const minValue = new Time(0, 0, 1);

    interface Props {
        // The bindable value of the duration field in seconds.
        seconds: number;
    }

    let { seconds = $bindable(60) }: Props = $props();
    // Convert seconds to a Time object for the TimeField.
    let duration = $state(
        new Time(Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60),
    );

    const timeSegmentPartAbbrs = new Map([
        ["hour", "hr"],
        ["minute", "min"],
        ["second", "sec"],
    ]);

    function getTimeSegmentPartAbbr(part: string): string {
        return timeSegmentPartAbbrs.get(part) || part;
    }

    function onValueChange(value: Time | undefined) {
        if (!value || value.compare(new Time(0)) === 0) duration = minValue;
        else duration = value;
        seconds = duration.hour * 60 ** 2 + duration.minute * 60 + duration.second;
    }
</script>

<TimeField.Root
    hourCycle={24}
    granularity="second"
    bind:value={duration}
    {minValue}
    placeholder={minValue}
    {onValueChange}
>
    <div class="flex gap-2">
        <TimeField.Label class="pt-1 text-xl text-muted">
            <span class="iconify lucide--timer"></span>
            <span class="sr-only">Custom time</span>
        </TimeField.Label>
        <TimeField.Input class="flex text-2xl">
            {#snippet children({ segments })}
                {#each segments as { part, value }, i (i)}
                    {#if part === "literal"}
                        <TimeField.Segment {part} class="px-1 text-muted">
                            {value}
                        </TimeField.Segment>
                    {:else}
                        <div>
                            <TimeField.Segment
                                {part}
                                class="block rounded
                                       bg-base-200 px-1
                                       tabular-nums
                                       inset-shadow-xs outline-offset-2 outline-primary hover:bg-base-300 focus:bg-primary focus:text-primary-content
                                       focus-visible:outline-2 aria-[valuetext=Empty]:text-muted"
                            >
                                {value}
                            </TimeField.Segment>
                            <div class="text-center text-xs text-muted">
                                {getTimeSegmentPartAbbr(part)}
                            </div>
                        </div>
                    {/if}
                {/each}
            {/snippet}
        </TimeField.Input>
    </div>
</TimeField.Root>
