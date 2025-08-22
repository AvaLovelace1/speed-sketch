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
        inputStyle?: "default" | "small";
        bgColor?: "base" | "primary";
    }

    let { seconds = $bindable(60), inputStyle = "default", bgColor = "base" }: Props = $props();
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

    let iconSize = $derived(inputStyle === "small" ? "text-lg" : "text-xl");
    let textSize = $derived(inputStyle === "small" ? "text-xl" : "text-2xl");
    let textColor = $derived(bgColor === "primary" ? "text-primary-content" : "text-muted");
    let fieldColors = $derived(
        bgColor === "primary"
            ? "outline-primary-content focus:text-primary focus:bg-primary-content focus:border-primary-content"
            : "outline-primary focus:text-primary-content focus:bg-primary focus:border-primary",
    );
</script>

<TimeField.Root
    hourCycle={24}
    granularity="second"
    bind:value={duration}
    {minValue}
    placeholder={minValue}
    {onValueChange}
>
    <div class="flex gap-2 {textColor}">
        <TimeField.Label class="pt-1 {iconSize}">
            <span class="iconify lucide--timer"></span>
            <span class="sr-only">Custom time</span>
        </TimeField.Label>
        <TimeField.Input class="flex {textSize}">
            {#snippet children({ segments })}
                {#each segments as { part, value }, i (i)}
                    {#if part === "literal"}
                        <TimeField.Segment {part} class="px-1">{value}</TimeField.Segment>
                    {:else}
                        <div>
                            <TimeField.Segment
                                {part}
                                class="block rounded border border-stroke-muted bg-base-200 px-1 text-base-content
                                       tabular-nums inset-shadow-xs outline-offset-2 hover:bg-base-300
                                       focus-visible:outline-2 {fieldColors}"
                            >
                                {value}
                            </TimeField.Segment>
                            <div class="cursor-default text-center text-xs">
                                {getTimeSegmentPartAbbr(part)}
                            </div>
                        </div>
                    {/if}
                {/each}
            {/snippet}
        </TimeField.Input>
    </div>
</TimeField.Root>
