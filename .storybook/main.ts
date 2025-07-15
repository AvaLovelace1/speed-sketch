import type { StorybookConfig } from "@storybook/sveltekit";

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(js|ts|svelte)"],
    addons: [
        "@chromatic-com/storybook",
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-svelte-csf",
        "@storybook/addon-themes",
        "@storybook/addon-vitest",
    ],
    framework: {
        name: "@storybook/sveltekit",
        options: {},
    },
};
export default config;
