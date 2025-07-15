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
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },

        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: "todo",
        },
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
