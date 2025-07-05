import { expect, test as base, type FileChooser } from "@playwright/test";
import fs from "node:fs";

import type { Page, Locator } from "@playwright/test";

const IMG_FOLDER = "test-assets";
const IMG_FILES = fs
    .readdirSync(IMG_FOLDER, { withFileTypes: true })
    .filter((file) => file.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file.name));
const IMG_FILENAMES = IMG_FILES.map((file) => file.name);

type AppFixtures = {
    mainMenuPage: MainMenuPage;
};

export const test = base.extend<AppFixtures>({
    mainMenuPage: async ({ page }, use) => {
        const mainMenuPage = new MainMenuPage(page);
        await mainMenuPage.goto();
        await use(mainMenuPage);
    },
});

class MainMenuPage {
    readonly dropzone: Locator;
    readonly customTimeBtn: Locator;
    readonly customTimeHrs: Locator;
    readonly customTimeMins: Locator;
    readonly customTimeSecs: Locator;
    readonly goBtn: Locator;

    constructor(public readonly page: Page) {
        this.dropzone = this.page.getByRole("button", { name: "Drag & drop" });
        this.customTimeBtn = this.page.getByRole("radio", { name: "Custom" });
        this.customTimeHrs = this.page.getByRole("spinbutton", { name: "hour, Custom time" });
        this.customTimeMins = this.page.getByRole("spinbutton", { name: "minute, Custom time" });
        this.customTimeSecs = this.page.getByRole("spinbutton", { name: "second, Custom time" });
        this.goBtn = this.page.getByRole("button", { name: "Go" });
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

    startSession = async () => {
        await this.goBtn.click();
    };
}

test("test", async ({ mainMenuPage }) => {
    await mainMenuPage.selectImgFiles(IMG_FOLDER);
    await mainMenuPage.expectImgThumbnails(IMG_FILENAMES);
    await mainMenuPage.startSession();
});
