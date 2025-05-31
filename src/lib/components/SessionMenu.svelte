<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import FolderInput from "$lib/components/FolderInput.svelte";
    import ButtonGroup from '$lib/components/ButtonGroup.svelte';

    interface Props {
        title: string;
        imgShowTimes: string[];
    }

    const {title, imgShowTimes}: Props = $props();
</script>

<div class="bg-primary fixed inset-0 flex items-center">
    <div class="card bg-base-100 w-md shadow-sm m-auto p-5">
        <div class="card-body items-center text-center">
            <h1 class="card-title text-5xl font-light">{title}</h1>
            <div class="divider mt-1 mb-6"><span class="opacity-50"><em>timed drawing sessions</em></span></div>
            <div class="grid gap-3">
                <FolderInput/>
                <ButtonGroup name="imgShowTime" labels={imgShowTimes}/>
                <Button label="GO! ▶" class_="btn-success btn-block"/>
            </div>
        </div>
    </div>
</div>