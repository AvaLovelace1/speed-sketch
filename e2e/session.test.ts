import {expect, type Page, test} from '@playwright/test';

test.describe('/session', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/session');
    });

    test('show controls on mouse move', async ({page}) => {
        const main = page.getByRole('main');
        await main.hover();
        await expectControlsVisible(page);

        // Hide controls after inactivity
        await page.waitForTimeout(3000);
        await expectControlsHidden(page);

        // Show controls again on mouse move
        await main.hover();
        await expectControlsVisible(page);

        // Hide controls after moving off the page
        await page.mouse.move(-1, -1);
        await expectControlsHidden(page);
    });

    test('pause button works', async ({page}) => {
        const main = page.getByRole('main');
        await main.hover();
        await expectControlsVisible(page);
        await pauseButton(page).click();
        await expect(resumeButton(page)).toBeVisible();
        await resumeButton(page).click();
        await expect(pauseButton(page)).toBeVisible();
    });

    test('press space to pause/resume', async ({page}) => {
        const main = page.getByRole('main');
        await main.press(' ');
        await expect(resumeButton(page)).toBeVisible();
        await main.press(' ');
        await expect(pauseButton(page)).toBeVisible();
    });

    test('timer pauses on pause', async ({page}) => {
        const main = page.getByRole('main');
        await main.press(' ');
        const initialTime = await timerStatus(page).textContent();
        await page.waitForTimeout(5000);
        const pausedTime = await timerStatus(page).textContent();
        expect(pausedTime).toBe(initialTime); // Time should not change while paused

        await main.press(' ');
        await page.waitForTimeout(5000);
        const resumedTime = await timerStatus(page).textContent();
        expect(resumedTime).not.toBe(initialTime); // Time should change after resuming
    });

    test('exit button works', async ({page}) => {
        await expectControlsVisible(page);
        await exitButton(page).click();
        await expect(page).toHaveURL('/');
    });
});

function controls(page: Page) {
    return [prevButton(page), nextButton(page), pauseButton(page), exitButton(page), completedStatus(page)];
}

function prevButton(page: Page) {
    return page.getByRole('button', {name: /.*prev.*/i});
}

function nextButton(page: Page) {
    return page.getByRole('button', {name: /.*next.*/i});
}

function pauseButton(page: Page) {
    return page.getByRole('button', {name: /.*pause.*/i});
}

function resumeButton(page: Page) {
    return page.getByRole('button', {name: /.*resume.*/i});
}

function exitButton(page: Page) {
    return page.getByRole('button', {name: /.*exit.*/i});
}

function completedStatus(page: Page) {
    return page.getByRole('status', {name: /.*completed.*/i});
}

function timerStatus(page: Page) {
    return page.getByRole('timer');
}

async function expectControlsVisible(page: Page) {
    for (const elem of controls(page)) await expect(elem).toBeVisible();
}

async function expectControlsHidden(page: Page, timeout = 500) {
    for (const elem of controls(page)) await expect(elem).not.toBeVisible({timeout: timeout});
}
