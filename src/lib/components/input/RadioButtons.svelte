<script lang="ts">
    import { RadioGroup } from "bits-ui";

    interface Item {
        label: string;
        value?: string; // If not provided, defaults to label
    }

    interface Props extends RadioGroup.RootProps {
        // Label for the radio group
        groupLabel: string;
        // Array of options for the radio buttons
        items: Item[];
        // Group variable to bind the selected value
        group: string;
    }

    let { groupLabel, items, group = $bindable(), ...props }: Props = $props();
</script>

<fieldset>
    <legend class="mb-2 text-sm text-muted">{groupLabel}</legend>
    <RadioGroup.Root
        bind:value={group}
        orientation="horizontal"
        {...props}
        class={["join", props.class]}
    >
        {#each items as { label, value = label } (label)}
            <RadioGroup.Item class="btn join-item aria-checked:btn-primary" {value}>
                {label}
            </RadioGroup.Item>
        {/each}
    </RadioGroup.Root>
</fieldset>
