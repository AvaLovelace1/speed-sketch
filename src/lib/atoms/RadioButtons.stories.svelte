<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import RadioButtons from "./RadioButtons.svelte";

    const { Story } = defineMeta({
        title: "Atoms/RadioButtons",
        component: RadioButtons,
        tags: ["autodocs"],
        args: {
            groupLabel: "Select an option",
            items: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" },
            ],
            group: "option1",
        },
    });
</script>

<!-- A group of buttons functioning as a radio select. -->
<Story name="Default" />
