<script lang="ts">
    import {type Component} from 'svelte';

    interface Control {
        label: string;
        Icon?: Component;
        action: () => void;
        btnClass?: string;
    }

    interface Props {
        controls: Control[];
    }

    let {controls}: Props = $props();
</script>


<div class="join rounded shadow-sm">
    {#each controls as Control}
        <button class="btn join-item btn-soft {Control.btnClass}" onclick={Control.action}>
            <Control.Icon size={20}/>
            {Control.label}
        </button>
    {/each}
</div>
