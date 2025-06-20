<script lang="ts">
    import { Tooltip } from "bits-ui";
    import SessionUI from "../routes/session/SessionUI.svelte";

    const props = $props();
</script>

<Tooltip.Provider>
    <SessionUI {...props} />
</Tooltip.Provider>
