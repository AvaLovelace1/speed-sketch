import { expect, test, type FileChooser } from "@playwright/test";
import fs from "node:fs";

import type { Page, Locator } from "@playwright/test";

const IMG_FOLDER = "test-assets";
const IMG_FILES = fs
    .readdirSync(IMG_FOLDER, { withFileTypes: true })
    .filter((file) => file.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file.name));
const IMG_FILENAMES = IMG_FILES.map((file) => file.name);

class MainMenuPage {
    readonly dropzone: Locator;
    readonly customTimeBtn: Locator;
    readonly customTimeHrs: Locator;
    readonly customTimeMins: Locator;
    readonly customTimeSecs: Locator;
    readonly goBtn: Locator;

    // Settings
    readonly settingsBtn: Locator;
    readonly themeBtn: Locator;
    readonly volumeSlider: Locator;
    readonly contrastSlider: Locator;
    readonly blurSlider: Locator;
    readonly closeBtn: Locator;

    constructor(public readonly page: Page) {
        this.dropzone = this.page.getByRole("button", { name: "Drag & drop" });
        this.customTimeBtn = this.page.getByRole("radio", { name: "Custom" });
        this.customTimeHrs = this.page.getByRole("spinbutton", { name: "hour, Custom time" });
        this.customTimeMins = this.page.getByRole("spinbutton", { name: "minute, Custom time" });
        this.customTimeSecs = this.page.getByRole("spinbutton", { name: "second, Custom time" });
        this.goBtn = this.page.getByRole("button", { name: "Go" });

        this.settingsBtn = this.page.getByRole("button", { name: "Settings" });
        this.themeBtn = this.page.getByRole("button", { name: "Theme" });
        this.volumeSlider = this.page.getByRole("slider", { name: "Volume" });
        this.contrastSlider = this.page.getByRole("slider", { name: "Contrast" });
        this.blurSlider = this.page.getByRole("slider", { name: "Blur" });
        this.closeBtn = this.page.getByRole("button", { name: "Close" });
    }

    goto = async () => {
        await this.page.goto("/");
    };

    selectImgFiles = async (files: Parameters<FileChooser["setFiles"]>[0]) => {
        const fileChooserPromise = this.page.waitForEvent("filechooser");
        await this.dropzone.click();
        const fileChooser = await fileChooserPromise;
        expect(fileChooser.isMultiple()).toBe(true);
        await fileChooser.setFiles(files);
    };

    // Check that shown images have alts that match the given names
    expectImgThumbnails = async (imgNames: string[]) => {
        const shownImgs = this.page.getByRole("img", { name: "thumbnail" });
        await expect(shownImgs).toHaveCount(imgNames.length);
        for (const imgName of imgNames) {
            const img = this.page.getByRole("img", { name: `thumbnail for ${imgName}` });
            await expect(img).toBeVisible();
        }
    };

    setCustomImgShowTime = async ({
        hrs,
        mins,
        secs,
    }: {
        hrs: number;
        mins: number;
        secs: number;
    }) => {
        await this.customTimeBtn.click();
        await this.customTimeHrs.fill(hrs.toString());
        await this.customTimeMins.fill(mins.toString());
        await this.customTimeSecs.fill(secs.toString());
    };

    expectCustomImgShowTime = async ({
        hrs,
        mins,
        secs,
    }: {
        hrs: number;
        mins: number;
        secs: number;
    }) => {
        await expect(this.customTimeBtn).toBeChecked();
        await expect(this.customTimeHrs).toHaveValue(hrs.toString());
        await expect(this.customTimeMins).toHaveValue(mins.toString());
        await expect(this.customTimeSecs).toHaveValue(secs.toString());
    };

    setAppSettings = async ({
        theme,
        volume,
        contrastStrength,
        blurStrength,
    }: {
        theme?: string;
        volume?: number;
        contrastStrength?: number;
        blurStrength?: number;
    }) => {
        await this.settingsBtn.click();
        if (theme !== undefined) {
            await this.themeBtn.click();
            await this.page.getByRole("option", { name: theme }).click();
        }
        if (volume !== undefined) {
            await this.volumeSlider.fill(volume.toString());
        }
        if (contrastStrength !== undefined) {
            await this.contrastSlider.fill(contrastStrength.toString());
        }
        if (blurStrength !== undefined) {
            await this.blurSlider.fill(blurStrength.toString());
        }
        await this.page.keyboard.press("Escape"); // Close settings dialog
    };

    expectAppSettings = async ({
        theme,
        volume,
        contrastStrength,
        blurStrength,
    }: {
        theme?: string;
        volume?: number;
        contrastStrength?: number;
        blurStrength?: number;
    }) => {
        await this.settingsBtn.click();
        if (theme !== undefined) {
            await expect(this.themeBtn).toHaveText(theme);
        }
        if (volume !== undefined) {
            await expect(this.volumeSlider).toHaveValue(volume.toString());
        }
        if (contrastStrength !== undefined) {
            await expect(this.contrastSlider).toHaveValue(contrastStrength.toString());
        }
        if (blurStrength !== undefined) {
            await expect(this.blurSlider).toHaveValue(blurStrength.toString());
        }
        await this.page.keyboard.press("Escape"); // Close settings dialog
    };

    startSession = async () => {
        await this.goBtn.click();
    };
}

test("main menu page works", async ({ page }) => {
    const mainMenuPage = new MainMenuPage(page);
    await mainMenuPage.goto();

    const customImgShowTime = { hrs: 0, mins: 12, secs: 24 };
    await mainMenuPage.selectImgFiles(IMG_FOLDER);
    await mainMenuPage.expectImgThumbnails(IMG_FILENAMES);
    await mainMenuPage.setCustomImgShowTime(customImgShowTime);

    await mainMenuPage.startSession();
});

test("settings are saved", async ({ page }) => {
    // Set settings
    let mainMenuPage = new MainMenuPage(page);
    await mainMenuPage.goto();
    const appSettings = {
        theme: "Light",
        volume: 0.2,
        contrastStrength: 1,
        blurStrength: 3,
    };
    await mainMenuPage.setAppSettings(appSettings);
    // This is just to make sure the setting dialog has closed and the settings are saved
    await mainMenuPage.expectAppSettings(appSettings);

    // Close and open page, then check if settings are saved
    await page.close();
    const newPage = await page.context().newPage();
    mainMenuPage = new MainMenuPage(newPage);
    await mainMenuPage.goto();
    await mainMenuPage.expectAppSettings(appSettings);
});
