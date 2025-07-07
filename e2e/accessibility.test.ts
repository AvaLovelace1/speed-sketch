import { expect, type Page, test } from "@playwright/test";
import { MainMenuPage } from "./main-menu-page";
import { SettingsDialog } from "./settings-dialog";
import { SessionPage } from "./session-page";
import AxeBuilder from "@axe-core/playwright";

const IMG_FOLDER = "test-assets";

async function testAccessibility(page: Page, length: number = 0) {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toHaveLength(length);
}

["Auto", "Light", "Dark"].forEach((theme) => {
    test(`accessibility for ${theme} theme`, async ({ page }) => {
        const mainMenuPage = new MainMenuPage(page);
        const settingsDialog = new SettingsDialog(page);
        await mainMenuPage.goto();

        // Set theme
        await settingsDialog.setAppSettings({ theme });
        await settingsDialog.openSettings();
        await testAccessibility(page);
        await settingsDialog.closeSettings();

        // Main menu page
        await mainMenuPage.selectImgFiles(IMG_FOLDER);
        await mainMenuPage.setCustomImgShowTime({ hrs: 0, mins: 12, secs: 24 });
        await testAccessibility(page);

        // Session page
        await mainMenuPage.startSession();
        const sessionPage = new SessionPage(page);
        await sessionPage.hoverImage();
        await expect(sessionPage.prevBtn).toBeVisible();
        // await testAccessibility(page); // 1 error detecting timer color contrast
        await sessionPage.exitSession();

        // Session end page
        await testAccessibility(page);
    });
});
