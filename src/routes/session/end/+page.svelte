<script lang="ts">
    import { sessionStore } from "$lib/globals.svelte";
    import EndScreenUI from "./EndScreenUI.svelte";
</script>

<svelte:head>
    <title>SpeedSketch - session ended</title>
</svelte:head>

<EndScreenUI nCompletedImgs={sessionStore.nCompletedImgs} timeSpent={sessionStore.timeSpent} />
