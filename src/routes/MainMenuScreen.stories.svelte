<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuScreen from "./MainMenuScreen.svelte";
    import { SessionSettings } from "$lib/store/session-settings.svelte";
    import Sample1 from "$lib/assets/images/pexels-by-hong-son.jpg";
    import Sample2 from "$lib/assets/images/pexels-by-sasha-kim.jpg";
    import Sample3 from "$lib/assets/images/pexels-by-andrew-sindt.jpg";
    import { fn } from "storybook/test";

    const img1 = { name: "img1.jpg", url: Sample1 };
    const img2 = { name: "img2.jpg", url: Sample2 };
    const img3 = { name: "img3.jpg", url: Sample3 };

    const { Story } = defineMeta({
        title: "Screens/MainMenuScreen",
        component: MainMenuScreen,
        tags: ["autodocs"],
        args: {
            includeTooltipProvider: true,
            onImgsInput: fn(),
            startSession: fn(),
        },
    });
</script>

<!-- The user sees this on first startup. -->
<Story name="Default" />

<!-- Loading images. -->
<Story name="Loading Images" args={{ isLoadingImgs: true, canStartSession: false }} />

<!-- More images loaded than can fit in the thumbnail grid. -->
<Story
    name="Many Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2, img3, img1, img2, img3],
        canStartSession: true,
    }}
/>

<!-- Enough images loaded to exactly fill the thumbnail grid. -->
<Story
    name="Some Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
    }}
/>

<!-- One image loaded. -->
<Story name="One Image" args={{ imgs: [img1], canStartSession: true }} />

<!-- Invalid image folder chosen. -->
<Story name="Invalid" args={{ imgErrMsg: "No images found", canStartSession: false }} />

<!-- The Tauri UI shows the shows the "include subfolders" checkbox, shows the folder name, and hides the "no upload" message. -->
<Story
    name="Tauri"
    args={{
        sessionSettings: new SessionSettings({
            imgFolder: "C:\\Users\\User\\Pictures",
        }),
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
        isTauri: true,
    }}
/>
