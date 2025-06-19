<script lang="ts">
    import { RadioGroup } from "bits-ui";

    interface Option {
        label: string;
        value?: string; // If not provided, defaults to label
    }

    interface Props extends RadioGroup.RootProps {
        // Label for the radio group
        groupLabel: string;
        // Array of options for the radio buttons
        options: Option[];
        // Group variable to bind the selected value
        group: string;
    }

    let { groupLabel, options, group = $bindable(), ...props }: Props = $props();
</script>

<fieldset>
    <legend class="label mb-2 block">{groupLabel}</legend>
    <RadioGroup.Root bind:value={group} required {...props} class={["join", props.class]}>
        {#each options as { label, value = label } (label)}
            <RadioGroup.Item class="join-item btn aria-checked:btn-primary" {value}>
                {label}
            </RadioGroup.Item>
        {/each}
    </RadioGroup.Root>
</fieldset>
