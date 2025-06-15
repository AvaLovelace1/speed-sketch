<script lang="ts">
    import { open } from '@tauri-apps/plugin-dialog';

    interface Props {
        chosenFolder?: string;
        // Callback function to handle the chosen folder
        callback?: (folder: string) => void;
        // Optional messages for user feedback; will appear below the input
        infoMsg?: string;
        errorMsg?: string;
    }

    let {
        chosenFolder = $bindable(''),
        callback = (_) => {},
        infoMsg = '',
        errorMsg = '',
    }: Props = $props();

    async function chooseFolder() {
        const folder = await open({ directory: true, multiple: false, title: 'Choose Folder' });
        if (folder) chosenFolder = folder;
        callback(chosenFolder);
    }
</script>

<div class="join w-full">
    <div class="w-full">
        <label class="input validator join-item" aria-invalid={errorMsg !== ''}>
            <input
                type="text"
                class="overflow-ellipsis"
                placeholder="Image folder"
                bind:value={chosenFolder}
                aria-label="Chosen folder"
                required
                readonly
            />
        </label>
        {#if errorMsg}
            <div role="alert" class="validator-hint" aria-label="Error message">{errorMsg}</div>
        {/if}
        {#if infoMsg}
            <div role="status" class="validator-hint visible opacity-50" aria-label="Info message">
                {infoMsg}
            </div>
        {/if}
    </div>
    <button
        type="button"
        class="join-item btn btn-primary"
        onclick={chooseFolder}
        aria-label="Choose a folder"
    >
        CHOOSE…
    </button>
</div>
