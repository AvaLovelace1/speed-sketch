<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuUI from "../routes/MainMenuUI.svelte";
    import Sample1 from "./assets/pexels-by-hong-son.jpg";
    import Sample2 from "./assets/pexels-by-sasha-kim.jpg";
    import Sample3 from "./assets/pexels-by-andrew-sindt.jpg";
    import type { SessionSettings } from "$lib/session-settings.svelte";

    const { Story } = defineMeta({
        title: "MainMenuUI",
        component: MainMenuUI,
        tags: ["autodocs"],
    });

    const sessionSettings: SessionSettings = {
        imgFolder: "/Users/alice/Pictures",
        includeSubfolders: false,
        shuffleImgs: true,
        imgShowTimeOption: "30s",
        imgShowTimeCustom: 102,
    };
</script>

<!-- The user sees this on first startup. -->
<Story name="Default" args={{ sessionSettings }} />

<!-- Custom time entry. -->
<Story name="Custom Image Show Time" args={{ sessionSettings }} />

<!-- Loading images. -->
<Story
    name="Loading Images"
    args={{
        sessionSettings,
        isLoadingImgs: true,
    }}
/>

<!-- 12 images loaded. -->
<Story
    name="Twelve Images"
    args={{
        sessionSettings,
        imgUrls: [
            Sample1,
            Sample2,
            Sample3,
            Sample1,
            Sample2,
            Sample3,
            Sample1,
            Sample2,
            Sample3,
            Sample1,
            Sample2,
            Sample3,
        ],
        isValid: true,
    }}
/>

<!-- 6 images loaded. -->
<Story
    name="Six Images"
    args={{
        sessionSettings,
        imgUrls: [Sample1, Sample2, Sample3, Sample1, Sample2, Sample3],
        isValid: true,
    }}
/>

<!-- 1 image loaded. -->
<Story
    name="One Image"
    args={{
        sessionSettings,
        imgUrls: [Sample1],
        isValid: true,
    }}
/>

<!-- Invalid image folder chosen. -->
<Story
    name="Invalid"
    args={{
        sessionSettings,
        folderErr: "No images found in folder",
        isValid: false,
    }}
/>
