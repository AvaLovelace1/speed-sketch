<script lang="ts">
    import { currentSession } from "$lib/drawing-session.svelte";
    import EndScreen from "./EndScreen.svelte";
</script>

<svelte:head>
    <title>SpeedSketch - session ended</title>
</svelte:head>

<EndScreen
    nCompletedImgs={currentSession.object.nCompletedImgs}
    timeSpent={currentSession.object.timeSpent}
/>
