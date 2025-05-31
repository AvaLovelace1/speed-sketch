<script lang="ts">
    interface Props {
        name: string;
        labels: string[];
    }

    const {name, labels}: Props = $props();
</script>

<div class="join">
    {#each labels as label}
        <input class="join-item btn" type="radio" name="{name}" aria-label="{label}"/>
    {/each}
</div>