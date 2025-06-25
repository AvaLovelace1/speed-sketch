<script lang="ts">
    import { currentSession } from "$lib/drawing-session.svelte";
    import EndScreenUI from "./EndScreenUI.svelte";
</script>

<svelte:head>
    <title>SpeedSketch - session ended</title>
</svelte:head>

<EndScreenUI
    nCompletedImgs={currentSession.object.nCompletedImgs}
    timeSpent={currentSession.object.timeSpent}
/>
