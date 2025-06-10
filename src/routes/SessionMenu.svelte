<script lang="ts">
    import {goto} from '$app/navigation';
    import {convertFileSrc, invoke} from "@tauri-apps/api/core";
    import {load} from '@tauri-apps/plugin-store';
    import FolderInput from './FolderInput.svelte';
    import RadioButtons from './RadioButtons.svelte';

    interface Props {
        title?: string;
        subtitle?: string;
        imgShowTimes?: number[];
    }

    const {
        title = 'SpeedSketch',
        subtitle = 'timed drawing sessions',
        imgShowTimes = [30, 45, 60, 120, 300, 600],
    }: Props = $props();

    function getLabel(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return (minutes ? `${minutes}m` : '') + (secs ? `${secs}s` : '');
    }

    const imgShowTimeOptions = imgShowTimes.map(seconds => ({label: getLabel(seconds), value: seconds}));
    let imgShowTime = $state(imgShowTimeOptions[0].value);

    let chosenFolder = $state('');
    let imgFiles: string[] = $state([]);
    let folderError = $derived.by(() => {
        if (chosenFolder === '') {
            return 'Please choose a folder';
        }
        if (imgFiles.length === 0) {
            return 'No images found in folder';
        }
        return '';
    });
    let showFolderError = $state(false);
    let folderInfoMsg = $derived.by(() => {
        if (imgFiles.length > 0) {
            return `Found ${imgFiles.length} images`;
        }
        return '';
    });
    let isValid = $derived.by(() => {
        return folderError === '';
    });

    async function setChosenFolder(folder: string) {
        chosenFolder = folder;
        imgFiles = await invoke('get_img_paths', {dir: folder});
        showFolderError = true;
    }

    async function handleSubmit() {
        if (!isValid) return;
        const store = await load('store.json', {autoSave: false});
        await store.set('chosenFolder', chosenFolder);
        await store.set('imgFiles', imgFiles);
        await store.set('imgShowTime', imgShowTime);
        await store.save();
        goto('/session');
    }

    async function loadStore() {
        const store = await load('store.json', {autoSave: false});
        const chosenFolderStore = await store.get('chosenFolder');
        if (chosenFolderStore !== undefined) {
            await setChosenFolder(chosenFolderStore as string);
        }
        const imgShowTimeStore = await store.get('imgShowTime');
        if (imgShowTimeStore !== undefined) {
            imgShowTime = imgShowTimeStore as number;
        }
    }

    loadStore();

</script>

<div class="card w-fit bg-base-100 shadow-sm">
    <div class="card-body items-center">
        <h1 class="card-title text-5xl font-thin">{title}</h1>
        <div class="divider text-lg mt-1 mb-5 font-light">
            <span class="opacity-50"><em>{subtitle}</em></span>
        </div>
        <form class="grid gap-3">
            <FolderInput bind:chosenFolder callback={setChosenFolder}
                         errorMsg={showFolderError ? folderError : ''} infoMsg={folderInfoMsg}/>
            {#if imgFiles.length > 0}
                <div class="-mt-1 grid grid-cols-5 gap-1">
                    {#each {length: 5} as _, i}
                        {#if imgFiles[i]}
                            <img src={convertFileSrc(imgFiles[i])} alt="Preview {i}"
                                 class="w-16 h-16 object-cover rounded"/>
                        {/if}
                    {/each}
                </div>
            {/if}
            <RadioButtons name="imgShowTime" options={imgShowTimeOptions} bind:group={imgShowTime}/>
            <input type="submit" class="btn btn-success btn-block" value="GO! ▶" onclick={handleSubmit}
                   disabled={!isValid}/>
        </form>
    </div>
</div>
