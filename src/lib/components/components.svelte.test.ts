import {describe, expect, test} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/svelte';
import Timer from './Timer.svelte';

describe('Timer.svelte', () => {
    test('timeRemaining 0', async () => {
        render(Timer, {time: 0});
        expect(screen.getByRole('timer')).toHaveTextContent(/ 0:00$/);
    });
    test('timeRemaining 10.5', async () => {
        render(Timer, {time: 10.5});
        expect(screen.getByRole('timer')).toHaveTextContent(/ 0:10$/);
    });
    test('timeRemaining 3600', async () => {
        render(Timer, {time: 3600});
        expect(screen.getByRole('timer')).toHaveTextContent(/ 1:00:00$/);
    });
    test('timeRemaining -3610', async () => {
        render(Timer, {time: -3610});
        expect(screen.getByRole('timer')).toHaveTextContent(/ -1:00:10$/);
    });
});
