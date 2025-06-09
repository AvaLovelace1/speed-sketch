<script lang="ts">
    import SessionMenu from '$lib/components/SessionMenu.svelte';
</script>

<svelte:head>
    <title>SpeedSketch</title>
</svelte:head>

<div class="bg-primary fixed inset-0"></div> <!-- Background overlay -->
<div class="flex flex-col min-h-dvh items-center justify-center">
    <SessionMenu/>
</div>
