import { describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import SessionUI from './SessionUI.svelte';
import Toolbar from './Toolbar.svelte';
import StatusAlert from './StatusAlert.svelte';
import Timer from './Timer.svelte';

describe.concurrent('SessionUI.svelte', () => {
    test('session UI renders', async () => {
        render(SessionUI);
        expect(screen.getByRole('img')).toBeVisible();
        expect(screen.getByRole('timer', { name: /.*remaining.*/i })).toBeVisible();
    });
});

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

describe('Toolbar.svelte', () => {
    test('menu buttons work', async () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        render(Toolbar, {
            tools: [
                { key: 1, label: 'Tool 1', icon: 'pause', action: handler1 },
                { key: 2, label: 'Tool 2', action: handler2 },
            ],
        });

        const tool1 = screen.getByRole('button', { name: 'Tool 1' });
        const tool2 = screen.getByRole('button', { name: 'Tool 2' });
        const user = userEvent.setup();
        await user.click(tool1);
        await user.click(tool2);
        await user.click(tool2);
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(2);
    });
    test('custom class is applied', () => {
        const handler1 = vi.fn();
        render(Toolbar, {
            tools: [{ key: 1, label: 'Tool 1', action: handler1, class: 'custom-class' }],
        });

        expect(screen.getByRole('button', { name: 'Tool 1' })).toHaveClass('custom-class');
    });
    test('hotkeys work', async () => {
        const handler1 = vi.fn();
        render(Toolbar, {
            tools: [{ key: 1, label: 'Tool 1', action: handler1, hotkey: 'a' }],
        });

        const user = userEvent.setup();
        await user.keyboard('a');
        expect(handler1).toHaveBeenCalledTimes(1);
    });
});
