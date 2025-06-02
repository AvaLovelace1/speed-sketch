<script lang="ts">
    import {open} from '@tauri-apps/plugin-dialog';

    let chosenFolder = $state('');
    let folderErrorMsg = $state('');

    async function chooseFolder() {
        const folder = await open({directory: true, multiple: false, title: 'Choose Image Folder'});
        if (folder) {
            chosenFolder = folder;
            folderErrorMsg = checkErrorMsg();
        }
    }

    function checkErrorMsg() {
        if (chosenFolder.length === 0) return 'Please choose a folder';
        return '';
    }
</script>

<div class="join">
    <div class="w-full">
        <label class="input validator join-item {folderErrorMsg ? 'border border-error' : ''}">
            <input class="overflow-ellipsis" placeholder="Image folder" value={chosenFolder} required readonly/>
        </label>
        {#if folderErrorMsg}
            <div class="validator-hint visible text-error">{folderErrorMsg}</div>
        {/if}
    </div>
    <button class="join-item btn btn-primary" onclick={chooseFolder}>CHOOSE…</button>
</div>
