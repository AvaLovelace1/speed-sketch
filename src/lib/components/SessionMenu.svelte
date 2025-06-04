<script lang="ts">
    import FolderInput from '$lib/components/FolderInput.svelte';
    import RadioButtons from '$lib/components/RadioButtons.svelte';
    import {shared} from '$lib/shared.svelte.js';

    interface Props {
        title?: string;
        subtitle?: string;
        imgShowTimes?: string[];
    }


    const {
        title = 'SpeedSketch',
        subtitle = 'timed drawing sessions',
        imgShowTimes = ['30s', '45s', '1m', '2m', '5m', '10m']
    }: Props = $props();

    shared.folderInputIsValid = false; // Initialize the folder input validity state
</script>

<div class="card w-fit bg-base-100 shadow-sm">
    <div class="card-body items-center">
        <h1 class="card-title text-5xl font-thin">{title}</h1>
        <div class="divider text-lg mt-1 mb-5 font-light">
            <span class="opacity-50"><em>{subtitle}</em></span>
        </div>
        <form class="grid gap-3">
            <FolderInput/>
            <RadioButtons name="imgShowTime" labels={imgShowTimes}/>
            <button type="submit" class="btn btn-success btn-block" formaction="/session"
                    disabled={!shared.folderInputIsValid}>
                GO! ▶
            </button>
        </form>
    </div>
</div>
