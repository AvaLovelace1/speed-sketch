import {expect, test} from '@playwright/test';
import {type Page} from '@playwright/test';

test.describe('/session', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/session');
    });

    test('show controls on mouse move', async ({page}) => {
        await expectControlsHidden(page);
        await page.mouse.move(0, 0);
        await expectControlsVisible(page);

        // Hide controls after inactivity
        await page.waitForTimeout(3000);
        await expectControlsHidden(page);

        // Show controls again on mouse move
        await page.mouse.move(0, 0);
        await expectControlsVisible(page);

        // Hide controls after moving off the page
        await page.mouse.move(-1, -1);
        await expectControlsHidden(page);
    });
});

function locateControls(page: Page) {
    return [
        page.getByRole('button', {name: /.*prev.*/i}),
        page.getByRole('button', {name: /.*next.*/i}),
        page.getByRole('button', {name: /.*pause.*/i}),
        page.getByRole('button', {name: /.*exit.*/i}),
        page.getByRole('status', {name: /.*completed.*/i}),
    ];
}

async function expectControlsVisible(page: Page) {
    for (const elem of locateControls(page)) await expect(elem).toBeVisible();
}

async function expectControlsHidden(page: Page, timeout = 500) {
    for (const elem of locateControls(page)) await expect(elem).not.toBeVisible({timeout: timeout});
}
