<!--
@component
A field that allows the user to input a positive integer within a specified range.
-->
<script lang="ts">
    import type { FormEventHandler } from "svelte/elements";
    import { onMount } from "svelte";

    export interface Props {
        // The bindable value of the number field.
        value: number;
        id: string;
        minValue?: number;
        maxValue?: number;
        bgColor?: "base" | "primary";
    }

    let {
        value = $bindable(0),
        id,
        minValue = 1,
        maxValue = 999,
        bgColor = "base",
    }: Props = $props();

    let inputElement: HTMLInputElement | null = null;

    // Remove non-digit characters on input
    const oninput: FormEventHandler<HTMLInputElement> = (e) => {
        const target = e.target as HTMLInputElement;
        target.value = target.value.replace(/\D/g, "");
    };

    // Ensure the value is within the specified range on change
    const onchange: FormEventHandler<HTMLInputElement> = (e) => {
        const target = e.target as HTMLInputElement;
        value = Math.max(minValue, Math.min(maxValue, parseInt(target.value, 10) || 1));
        target.value = value.toString();
    };

    let fieldColors = $derived(
        bgColor === "primary"
            ? "outline-primary-content focus:text-primary focus:bg-primary-content focus:border-primary-content"
            : "outline-primary focus:text-primary-content focus:bg-primary focus:border-primary",
    );

    onMount(() => {
        if (inputElement) inputElement.value = value.toString();
    });
</script>

<input
    {id}
    bind:this={inputElement}
    type="number"
    inputmode="numeric"
    class="w-16 rounded border border-stroke-muted bg-base-200
           px-1 text-xl text-base-content tabular-nums inset-shadow-xs
           outline-offset-2 hover:bg-base-300 focus-visible:outline-2 {fieldColors}"
    min={minValue}
    max={maxValue}
    {oninput}
    {onchange}
    onkeydown={(e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputElement?.blur();
        }
    }}
/>
