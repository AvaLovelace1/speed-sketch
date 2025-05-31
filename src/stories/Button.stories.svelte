<script module>
    import {defineMeta} from '@storybook/addon-svelte-csf';
    import Button from '$lib/components/Button.svelte';

    const {Story} = defineMeta({
        title: 'Button',
        component: Button,
        tags: ['autodocs'],
    });
</script>

<Story name="Default" args={{ label: 'Button' }}/>
