<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import ButtonGroup from '$lib/components/ButtonGroup.svelte';
</script>

<h1>SpeedSketch</h1>
<div>
    <Button label="Select Image Folder" color="primary"/>
</div>
<ButtonGroup name="imgShowTime" labels={['30s', '45s', '1m', '2m', '5m', '10m']}/>
<div>
    <Button label="Go!" color="success"/>
</div>
