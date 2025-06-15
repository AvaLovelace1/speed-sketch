<script lang="ts">
    interface Option {
        label: string;
        value?: unknown; // If not provided, defaults to label
    }

    interface Props {
        // Unique name for the radio group
        name: string;
        // Array of options for the radio buttons
        options: Option[];
        // Group variable to bind the selected value
        group: unknown;
    }

    let { name, options, group = $bindable() }: Props = $props();
</script>

<div class="join">
    {#each options as { label, value = label }}
        <input class="join-item btn" type="radio" {name} {value} aria-label={label} bind:group />
    {/each}
</div>
