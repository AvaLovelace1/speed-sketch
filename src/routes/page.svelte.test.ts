import {describe, expect, test, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event'
import Page from './+page.svelte';
import FolderInput from './FolderInput.svelte';
import RadioButtons from './RadioButtons.svelte';

describe.concurrent('/+page.svelte', () => {
    render(Page);
    test('should render heading', () => {
        expect(screen.getByRole('heading', {name: 'SpeedSketch', level: 1})).toBeVisible();
    });
    test('should render folder select', () => {
        expect(screen.getByRole('button', {name: /.*choose.*/i})).toBeVisible();
    });
    test('should render image show time select', () => {
        const times = ['30s', '45s', '1m', '2m', '5m', '10m'];
        times.forEach(time => {
            expect(screen.getByRole('radio', {name: time})).toBeVisible();
        });
    });
    test('should render go button', () => {
        expect(screen.getByRole('button', {name: /.*go.*/i})).toBeVisible();
    });
});

describe('FolderInput.svelte', () => {
    test('folder input renders', () => {
        let callback = vi.fn();
        render(FolderInput, {callback: callback});
        let field = screen.getByRole('textbox', {name: /.*folder.*/i});
        let button = screen.getByRole('button', {name: /.*folder.*/i});

        expect(field).toBeVisible();
        expect(field).toBeRequired();
        expect(field).toHaveAttribute('readonly');
        expect(field).toHaveValue('');
        expect(button).toBeVisible();

        const user = userEvent.setup();
        user.click(button);
    });
    test('folder input renders info messages', () => {
        render(FolderInput, {errorMsg: 'Error message', infoMsg: 'Info message'});
        let error = screen.getByRole('alert', {name: /.*error.*/i});
        let info = screen.getByRole('status', {name: /.*info.*/i});

        expect(error).toHaveTextContent('Error message');
        expect(info).toHaveTextContent('Info message');
    });
});

describe('RadioButtons.svelte', () => {
    test('should render radio buttons', () => {
        let group = $state('');
        render(RadioButtons, {
            name: 'RadioButtons',
            options: [{label: 'Option 1'}, {label: 'Option 2', value: 'two'}],
            group: group,
        });
        let button1 = screen.getByRole('radio', {name: 'Option 1'});
        let button2 = screen.getByRole('radio', {name: 'Option 2'});

        expect(button1).toBeVisible();
        expect(button2).toBeVisible();
    });
});
