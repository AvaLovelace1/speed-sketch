import {describe, expect, test, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/svelte';
import {createRawSnippet} from 'svelte';
import {Skull} from '@lucide/svelte';
import ControlsMenu from './ControlsMenu.svelte';
import Timer from './Timer.svelte';
import StatusAlert from './StatusAlert.svelte';

describe('Alert.svelte', () => {
    test('renders with default props', () => {
        const snippet = () => ({
            render() {
                return '<span>Test Alert</span>'
            }
        });

        render(StatusAlert, {children: createRawSnippet(snippet), alertClass: 'custom-class'});
        const alert = screen.getByRole('status');
        expect(alert).toHaveTextContent('Test Alert');
        expect(alert).toHaveClass('custom-class');
    });
})

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
});

describe('ControlsMenu.svelte', () => {
    test('manu buttons work', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        render(ControlsMenu, {
            controls: [
                {label: 'Control 1', Icon: Skull, action: handler1},
                {label: 'Control 2', action: handler2, btnClass: 'btn-primary'},
            ]
        });

        screen.getByRole('button', {name: 'Control 1'}).click();
        screen.getByRole('button', {name: 'Control 2'}).click();
        screen.getByRole('button', {name: 'Control 2'}).click();

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(2);
    });
});
