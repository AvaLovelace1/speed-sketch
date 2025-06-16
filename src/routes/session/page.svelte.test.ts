import { describe, expect, test } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import StatusAlert from './StatusAlert.svelte';
import Timer from './Timer.svelte';

describe('StatusAlert.svelte', () => {
    test('alert renders', () => {
        const snippet = () => ({
            render() {
                return '<span>Test Alert</span>';
            },
        });

        render(StatusAlert, { children: createRawSnippet(snippet), class: 'custom-class' });
        const alert = screen.getByRole('status');
        expect(alert).toHaveTextContent('Test Alert');
        expect(alert).toHaveClass('custom-class');
    });
});

describe('Timer.svelte', () => {
    test('timeRemaining 0', async () => {
        render(Timer, { time: 0 });
        const timeElement = screen.getByRole('time');
        expect(timeElement).toHaveTextContent(/^0:00$/);
        expect(timeElement).toHaveAttribute('datetime', 'PT0H0M0S');
    });
    test('timeRemaining 10.5', async () => {
        render(Timer, { time: 10.5 });
        const timeElement = screen.getByRole('time');
        expect(timeElement).toHaveTextContent(/^0:10$/);
        expect(timeElement).toHaveAttribute('datetime', 'PT0H0M10S');
    });
    test('timeRemaining 3600', async () => {
        render(Timer, { time: 3600 });
        const timeElement = screen.getByRole('time');
        expect(timeElement).toHaveTextContent(/^1:00:00$/);
        expect(timeElement).toHaveAttribute('datetime', 'PT1H0M0S');
    });
    test('timeRemaining -3610', async () => {
        render(Timer, { time: -3610 });
        const timeElement = screen.getByRole('time');
        expect(timeElement).toHaveAttribute('datetime', 'PT1H0M10S');
    });
    test('custom class is applied', async () => {
        render(Timer, { time: 10, class: 'custom-class' });
        expect(screen.getByRole('timer')).toHaveClass('custom-class');
    });
});
