<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { Button } from "bits-ui";
</script>

<svelte:head>
    <title>SpeedSketch - error</title>
</svelte:head>

<div class="flex h-dvh items-center-safe justify-center-safe">
    <div class="text-center">
        <h1 class="mb-4 text-3xl font-semibold">Error {page.status}: {page.error?.message}</h1>
        <Button.Root class="btn" onclick={async () => await goto("/", { replaceState: true })}>
            Return to Main Menu
        </Button.Root>
    </div>
</div>
