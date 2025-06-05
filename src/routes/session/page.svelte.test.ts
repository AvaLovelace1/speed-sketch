import {describe, expect, test, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event'
import {createRawSnippet} from 'svelte';
import {Skull} from '@lucide/svelte';

import Page from './+page.svelte';
import ControlsMenu from './ControlsMenu.svelte';
import StatusAlert from './StatusAlert.svelte';
import Timer from './Timer.svelte';


describe.concurrent('/session/+page.svelte', () => {
    render(Page);
    test('should render image', async () => {
        expect(screen.getByRole('img')).toBeVisible();
    });
    test('should render timer', async () => {
        expect(screen.getByRole('timer', {name: /.*remaining.*/i})).toBeVisible();
    });
});

describe('Alert.svelte', () => {
    test('alert renders', () => {
        const snippet = () => ({
            render() {
                return '<span>Test Alert</span>'
            }
        });

        render(StatusAlert, {children: createRawSnippet(snippet), class: 'custom-class'});
        const alert = screen.getByRole('status');
        expect(alert).toHaveTextContent('Test Alert');
        expect(alert).toHaveClass('custom-class');
    });
});

describe('Timer.svelte', () => {
    test('timeRemaining 0', async () => {
        render(Timer, {time: 0});
        expect(screen.getByRole('timer')).toHaveTextContent(/^0:00$/);
    });
    test('timeRemaining 10.5', async () => {
        render(Timer, {time: 10.5});
        expect(screen.getByRole('timer')).toHaveTextContent(/^0:10$/);
    });
    test('timeRemaining 3600', async () => {
        render(Timer, {time: 3600});
        expect(screen.getByRole('timer')).toHaveTextContent(/^1:00:00$/);
    });
    test('timeRemaining -3610', async () => {
        render(Timer, {time: -3610});
        expect(screen.getByRole('timer')).toHaveTextContent(/^-1:00:10$/);
    });
    test('custom class is applied', async () => {
        render(Timer, {time: 10, class: 'custom-class'});
        expect(screen.getByRole('timer')).toHaveClass('custom-class');
    });
});

describe('ControlsMenu.svelte', () => {
    test('menu buttons work', async () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        render(ControlsMenu, {
            controls: [
                {label: 'Control 1', Icon: Skull, action: handler1},
                {label: 'Control 2', action: handler2},
            ]
        });

        const control1 = screen.getByRole('button', {name: 'Control 1'});
        const control2 = screen.getByRole('button', {name: 'Control 2'});
        const user = userEvent.setup();
        await user.click(control1);
        await user.click(control2);
        await user.click(control2);
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(2);
    });
    test('custom class is applied', () => {
        const handler1 = vi.fn();
        render(ControlsMenu, {
            controls: [{label: 'Control 1', action: handler1, class: 'custom-class'}]
        });

        expect(screen.getByRole('button', {name: 'Control 1'})).toHaveClass('custom-class');
    });
    test('hotkeys work', async () => {
        const handler1 = vi.fn();
        render(ControlsMenu, {
            controls: [
                {label: 'Control 1', action: handler1, hotkey: 'a'},
            ]
        });

        const user = userEvent.setup();
        await user.keyboard('a');
        expect(handler1).toHaveBeenCalledTimes(1);
    });
});
