<script lang="ts">
    import { RadioGroup } from "bits-ui";

    interface Item {
        label: string;
        value?: string; // If not provided, defaults to label
        description?: string;
    }

    interface Props extends RadioGroup.RootProps {
        // Label for the radio group
        groupLabel: string;
        // Array of options for the radio buttons
        items: Item[];
        // Group variable to bind the selected value
        group: string;
        buttonStyle?: "default" | "large";
    }

    let {
        groupLabel,
        items,
        group = $bindable(),
        buttonStyle = "default",
        ...props
    }: Props = $props();

    const itemClass =
        buttonStyle === "large"
            ? "group btn join-item aria-checked:btn-primary first:rounded-s-box last:rounded-e-box text-base grow block h-auto px-8 py-4"
            : "group btn join-item aria-checked:btn-primary grow";
</script>

<fieldset>
    <legend class="mb-2 cursor-default text-sm text-muted">{groupLabel}</legend>
    <RadioGroup.Root
        bind:value={group}
        orientation="horizontal"
        {...props}
        class={["join", props.class]}
    >
        {#each items as { label, value = label, description } (label)}
            <RadioGroup.Item class={itemClass} {value}>
                {label}
                {#if description}
                    <p
                        class="text-xs font-normal text-muted transition-[inherit] group-aria-checked:text-primary-content"
                    >
                        {description}
                    </p>
                {/if}
            </RadioGroup.Item>
        {/each}
    </RadioGroup.Root>
</fieldset>
