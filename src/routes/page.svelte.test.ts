import {describe, test, expect} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/svelte';
import Page from './+page.svelte';

describe.concurrent('/+page.svelte', () => {
    render(Page);
    test('should render heading', () => {
        expect(screen.getByRole('heading', {name: 'SpeedSketch', level: 1})).toBeVisible();
    });
    test('should render folder select', () => {
        expect(screen.getByRole('button', {name: /.*Folder.*/})).toBeVisible();
    });
    test('should render image show time select', () => {
        const times = ['30s', '45s', '1m', '2m', '5m', '10m'];
        times.forEach(time => {
            expect(screen.getByRole('radio', {name: time})).toBeVisible();
        });
    });
    test('should render go button', () => {
        expect(screen.getByRole('button', {name: /.*Go.*/})).toBeVisible();
    });
});
