import type {Preview} from '@storybook/sveltekit'
import '../src/app.css'

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {test: 'todo'},
    },
};

export default preview;
