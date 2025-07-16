import { expect } from "@playwright/test";
import type { Locator, Page, FileChooser } from "@playwright/test";

export class MainMenuPage {
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
        await this.customTimeHrs.click();
        const timeString = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        await this.customTimeHrs.pressSequentially(timeString);
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
        await expect(this.customTimeHrs).toHaveText(hrs.toString().padStart(2, "0"));
        await expect(this.customTimeMins).toHaveText(mins.toString().padStart(2, "0"));
        await expect(this.customTimeSecs).toHaveText(secs.toString().padStart(2, "0"));
    };

    startSession = async () => {
        await this.goBtn.click();
        await this.page.waitForURL("/session");
    };
}
