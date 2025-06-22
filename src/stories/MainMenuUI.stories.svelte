<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuUI from "../routes/MainMenuUI.svelte";
    import Sample1 from "./assets/pexels-by-hong-son.jpg";
    import Sample2 from "./assets/pexels-by-sasha-kim.jpg";
    import Sample3 from "./assets/pexels-by-andrew-sindt.jpg";

    const { Story } = defineMeta({
        title: "MainMenuUI",
        component: MainMenuUI,
        tags: ["autodocs"],
    });
</script>

<!-- The user sees this on first startup. -->
<Story name="Default" args={{ imgShowTimeSelected: "30", imgShowTimeCustom: 30 }} />

<!-- Custom time entry. -->
<Story
    name="Custom Image Show Time"
    args={{ imgShowTimeSelected: "custom", imgShowTimeCustom: 4414 }}
/>

<!-- Loading images. -->
<Story
    name="Loading Images"
    args={{
        imgShowTimeSelected: "30",
        imgShowTimeCustom: 45,
        imgFolder: "/Users/alice/Pictures",
        isLoadingImgs: true,
    }}
/>

<!-- 12 images loaded. -->
<Story
    name="Twelve Images"
    args={{
        imgShowTimeSelected: "30",
        imgShowTimeCustom: 45,
        imgFolder: "/Users/alice/Pictures",
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
        imgShowTimeSelected: "30",
        imgShowTimeCustom: 45,
        imgFolder: "/Users/alice/Pictures",
        imgUrls: [Sample1, Sample2, Sample3, Sample1, Sample2, Sample3],
        isValid: true,
    }}
/>

<!-- 1 image loaded. -->
<Story
    name="One Image"
    args={{
        imgShowTimeSelected: "30",
        imgShowTimeCustom: 45,
        imgFolder: "/Users/alice/Pictures",
        imgUrls: [Sample1],
        isValid: true,
    }}
/>

<!-- Invalid image folder chosen. -->
<Story
    name="Invalid"
    args={{
        imgShowTimeSelected: "30",
        imgShowTimeCustom: 45,
        imgFolder: "/Users/alice/Pictures/wrong-folder",
        folderErr: "No images found in folder",
        isValid: false,
    }}
/>
