import type { Preview, SvelteRenderer } from "@storybook/sveltekit";
import { withThemeByDataAttribute } from "@storybook/addon-themes";

import "../src/app.css";

const preview: Preview = {
    parameters: {
        backgrounds: {
            options: {
                base: { name: "Base", value: "var(--color-base-100)" },
            },
        },

        controls: {
            matchers: {
                date: /Date$/i,
            },
        },

        a11y: { test: "error" },
    },

    initialGlobals: {
        backgrounds: { value: "base" },
    },

    decorators: [
        withThemeByDataAttribute<SvelteRenderer>({
            themes: {
                light: "light",
                dark: "dark",
            },
            defaultTheme: "light",
            attributeName: "data-theme",
        }),
    ],
};

export default preview;
