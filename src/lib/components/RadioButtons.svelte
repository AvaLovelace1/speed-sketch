<script lang="ts">
    interface Props {
        name: string;
        labels: string[];
    }

    let imgShowTime = $state('30s');
    const {name, labels}: Props = $props();
</script>

<div class="join">
    {#each labels as label}
        <input class="join-item btn" type="radio" name="{name}"
               value={label} aria-label={label} bind:group={imgShowTime}/>
    {/each}
</div>