<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";

    const { Story } = defineMeta({
        title: "Colors",
        tags: ["autodocs"],
    });

    const colors = [
        {
            name: "Base-100",
            class_: "bg-base-100 text-base-content",
        },
        {
            name: "Base-200",
            class_: "bg-base-200 text-base-content",
        },
        {
            name: "Base-300",
            class_: "bg-base-300 text-base-content",
        },
        {
            name: "Primary",
            class_: "bg-primary text-primary-content",
        },
        {
            name: "Secondary",
            class_: "bg-secondary text-secondary-content",
        },
        {
            name: "Accent",
            class_: "bg-accent text-accent-content",
        },
        {
            name: "Neutral",
            class_: "bg-neutral text-neutral-content",
        },
        {
            name: "Info",
            class_: "bg-info text-info-content",
        },
        {
            name: "Success",
            class_: "bg-success text-success-content",
        },
        {
            name: "Warning",
            class_: "bg-warning text-warning-content",
        },
        {
            name: "Error",
            class_: "bg-error text-error-content",
        },
        {
            name: "Primary Text",
            class_: "bg-base-200 text-primary",
        },
        {
            name: "Secondary Text",
            class_: "bg-base-200 text-secondary",
        },
        {
            name: "Accent Text",
            class_: "bg-base-200 text-accent",
        },
        {
            name: "Muted Text",
            class_: "bg-base-200 text-muted",
        },
        {
            name: "Info Text",
            class_: "bg-base-200 text-info",
        },
        {
            name: "Success Text",
            class_: "bg-base-200 text-success",
        },
        {
            name: "Warning Text",
            class_: "bg-base-200 text-warning",
        },
        {
            name: "Error Text",
            class_: "bg-base-200 text-error",
        },
    ];

    const strokeColors = [
        {
            name: "Stroke",
            class_: "border text-stroke",
        },
        {
            name: "Stroke Muted",
            class_: "border text-stroke-muted",
        },
    ];
</script>

{#snippet themeColors()}
    <div class="flex flex-wrap gap-2">
        {#each colors as { name, class_ } (name)}
            <div class="flex size-32 items-center justify-center rounded p-2 {class_}">
                <div class="text-center">
                    <p class="text-xl font-semibold">{name}</p>
                    <p class="text-xs">{name}</p>
                </div>
            </div>
        {/each}
        {#each strokeColors as { name, class_ } (name)}
            <div class="flex size-32 items-center justify-center rounded p-2 {class_}">
                <div class="text-center">
                    <p><span class="iconify text-3xl lucide--heart"></span></p>
                    <p class="text-xs text-muted">{name}</p>
                </div>
            </div>
        {/each}
    </div>
{/snippet}

<!-- System theme colors. -->
<Story name="Default">
    {#snippet template(_args)}{@render themeColors()}{/snippet}
</Story>

<!-- Light theme colors. -->
<Story name="Light">
    {#snippet template(_args)}
        <div data-theme="light">{@render themeColors()}</div>
    {/snippet}
</Story>

<!-- Dark theme colors. -->
<Story name="Dark">
    {#snippet template(_args)}
        <div data-theme="dark">{@render themeColors()}</div>
    {/snippet}
</Story>
