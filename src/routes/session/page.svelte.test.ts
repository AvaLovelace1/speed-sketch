import {describe, expect, test} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/svelte';
import Page from './+page.svelte';

describe.concurrent('/+page.svelte', () => {
    render(Page);
    test('should render image', async () => {
        expect(screen.getByRole('img')).toBeVisible();
    });
    test('should render timer', async () => {
        expect(screen.getByRole('timer')).toBeVisible();
    });
});
