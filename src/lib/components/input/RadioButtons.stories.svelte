<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import RadioButtons from "./RadioButtons.svelte";

    const { Story } = defineMeta({
        title: "Components/Input/RadioButtons",
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

<!-- Large button style with descriptions. Descriptions look best in this style. -->
<Story
    name="Large"
    args={{
        buttonStyle: "large",
        items: [
            { label: "Option 1", value: "option1", description: "This is the first option." },
            { label: "Option 2", value: "option2", description: "This is the second option." },
            { label: "Option 3", value: "option3", description: "This is the third option." },
        ],
    }}
/>
