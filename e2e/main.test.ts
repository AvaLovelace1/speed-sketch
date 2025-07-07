import fs from "node:fs";
import { test } from "@playwright/test";
import { MainMenuPage } from "./main-menu-page";
import { SessionPage } from "./session-page";
import { SessionEndPage } from "./session-end-page";
import { SettingsDialog } from "./settings-dialog";

const IMG_FOLDER = "test-assets";
const IMG_FILES = fs
    .readdirSync(IMG_FOLDER, { withFileTypes: true })
    .filter((file) => file.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file.name));
const IMG_FILENAMES = IMG_FILES.map((file) => file.name);

test("typical user flow", async ({ page }) => {
    // Main menu page
    const mainMenuPage = new MainMenuPage(page);
    await mainMenuPage.goto();
    const customImgShowTime = { hrs: 0, mins: 12, secs: 24 };
    await mainMenuPage.selectImgFiles(IMG_FOLDER);
    await mainMenuPage.expectImgThumbnails(IMG_FILENAMES);
    await mainMenuPage.setCustomImgShowTime(customImgShowTime);

    // Session page
    await mainMenuPage.startSession();
    const sessionPage = new SessionPage(page);

    // Session end page
    await sessionPage.exitSession();
    const sessionEndPage = new SessionEndPage(page);
    await sessionEndPage.returnToMainMenu();

    // Main menu page again. Settings should be preserved
    await mainMenuPage.expectImgThumbnails(IMG_FILENAMES);
    await mainMenuPage.expectCustomImgShowTime(customImgShowTime);
});

test("settings are saved", async ({ page }) => {
    // Set settings
    let mainMenuPage = new MainMenuPage(page);
    let settingsDialog = new SettingsDialog(page);
    await mainMenuPage.goto();
    const appSettings = {
        theme: "Light",
        volume: 0.2,
        contrastStrength: 1,
        blurStrength: 3,
    };
    await settingsDialog.setAppSettings(appSettings);
    // This is just to make sure the setting dialog has closed and the settings are saved
    await settingsDialog.expectAppSettings(appSettings);

    // Close and open page, then check if settings are saved
    await page.close();
    const newPage = await page.context().newPage();
    mainMenuPage = new MainMenuPage(newPage);
    settingsDialog = new SettingsDialog(newPage);
    await mainMenuPage.goto();
    await settingsDialog.expectAppSettings(appSettings);
});
