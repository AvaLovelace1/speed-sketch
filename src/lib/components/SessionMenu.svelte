<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import FolderInput from "$lib/components/FolderInput.svelte";
    import RadioButtons from '$lib/components/RadioButtons.svelte';

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
</script>

<div class="card w-fit bg-base-100 shadow-sm">
    <div class="card-body items-center">
        <h1 class="card-title text-5xl font-thin">{title}</h1>
        <div class="divider text-lg mt-1 mb-5 font-light">
            <span class="opacity-50"><em>{subtitle}</em></span>
        </div>
        <div class="grid gap-3">
            <FolderInput/>
            <RadioButtons name="imgShowTime" labels={imgShowTimes}/>
            <Button label="GO! ▶" class_="btn-success btn-block" href="/session"/>
        </div>
    </div>
</div>
