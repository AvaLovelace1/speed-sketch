<script module>
    import {defineMeta} from '@storybook/addon-svelte-csf';
    import SessionMenu from '$lib/components/SessionMenu.svelte';

    const {Story} = defineMeta({
        title: 'SessionMenu',
        component: SessionMenu,
        tags: ['autodocs'],
    });
</script>

<Story name="Default"/>
