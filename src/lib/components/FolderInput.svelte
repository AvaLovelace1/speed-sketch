<script lang="ts">
    import { open } from "@tauri-apps/plugin-dialog";
    import type { HTMLAttributes } from "svelte/elements";
    import { Button, Label } from "bits-ui";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        label: string;
        chosenFolder?: string;
        // Callback function to handle the chosen folder
        callback?: (folder: string) => void;
        // Optional messages for user feedback; will appear below the input
        infoMsg?: string;
        errorMsg?: string;
    }

    let {
        label,
        chosenFolder = $bindable(""),
        callback = (_) => {},
        infoMsg = "",
        errorMsg = "",
        ...props
    }: Props = $props();

    async function chooseFolder() {
        const folder = await open({ directory: true, multiple: false, title: "Choose Folder" });
        if (folder) chosenFolder = folder;
        callback(chosenFolder);
    }
</script>

<Label.Root class="text-muted mb-2 block" for={label}>{label}</Label.Root>
<div {...props} class={["join", props.class]}>
    <div class="w-full">
        <div class="input validator join-item w-full" aria-invalid={errorMsg !== ""}>
            <span class="iconify lucide--folder text-muted"></span>
            <input
                id={label}
                type="text"
                class="overflow-ellipsis"
                bind:value={chosenFolder}
                aria-invalid={errorMsg !== ""}
                aria-describedby={errorMsg ? "error-message" : infoMsg ? "info-message" : undefined}
                required
                readonly
            />
        </div>
        {#if errorMsg}
            <div role="alert" class="validator-hint">{errorMsg}</div>
        {/if}
        {#if infoMsg}
            <div role="status" class="validator-hint visible opacity-60">{infoMsg}</div>
        {/if}
    </div>
    <Button.Root
        type="button"
        class="join-item btn btn-primary"
        onclick={chooseFolder}
        aria-label="Choose a folder"
    >
        Choose…
    </Button.Root>
</div>
