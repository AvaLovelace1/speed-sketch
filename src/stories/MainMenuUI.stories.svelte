<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuUI from "../routes/MainMenuUI.svelte";
    import Sample1 from "./assets/pexels-by-hong-son.jpg";
    import Sample2 from "./assets/pexels-by-sasha-kim.jpg";
    import Sample3 from "./assets/pexels-by-andrew-sindt.jpg";

    const img1 = { name: "img1.jpg", url: Sample1 };
    const img2 = { name: "img2.jpg", url: Sample2 };
    const img3 = { name: "img3.jpg", url: Sample3 };

    const { Story } = defineMeta({
        title: "MainMenuUI",
        component: MainMenuUI,
        tags: ["autodocs"],
    });
</script>

<!-- The user sees this on first startup. -->
<Story name="Default" args={{}} />

<!-- Loading images. -->
<Story
    name="Loading Images"
    args={{
        isLoadingImgs: true,
    }}
/>

<!-- 12 images loaded. -->
<Story
    name="Twelve Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2, img3, img1, img2, img3],
        canStartSession: true,
    }}
/>

<!-- 6 images loaded. -->
<Story
    name="Eight Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
    }}
/>

<!-- 1 image loaded. -->
<Story
    name="One Image"
    args={{
        imgs: [img1],
        canStartSession: true,
    }}
/>

<!-- Invalid image folder chosen. -->
<Story
    name="Invalid"
    args={{
        imgErrMsg: "No images found",
        canStartSession: false,
    }}
/>
