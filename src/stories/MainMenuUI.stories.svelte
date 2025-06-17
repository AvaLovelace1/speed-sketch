<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuUI from "../routes/MainMenuUI.svelte";

    const { Story } = defineMeta({
        title: "MainMenuUI",
        component: MainMenuUI,
        tags: ["autodocs"],
    });
</script>

<!-- The main menu. -->
<Story
    name="MainMenuUI"
    args={{
        imgShowTime: 45,
        imgFolder: "",
        imgPaths: [],
        folderErr: "",
        folderInfoMsg: "",
        isLoadingImgs: false,
        isValid: true,
        setImgFolder: async (folder) => {
            console.log("setImgFolder called with:", folder);
        },
        startSession: async () => {
            console.log("startSession called");
        },
    }}
/>
