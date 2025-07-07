import type { Locator, Page } from "@playwright/test";

export class SessionPage {
    readonly img: Locator;
    readonly prevBtn: Locator;
    readonly nextBtn: Locator;
    readonly pauseBtn: Locator;
    readonly resumeBtn: Locator;
    readonly resetZoomBtn: Locator;
    readonly zoomOutBtn: Locator;
    readonly zoomInBtn: Locator;
    readonly flipHorizontallyBtn: Locator;
    readonly flipVerticallyBtn: Locator;
    readonly greyscaleBtn: Locator;
    readonly contrastBtn: Locator;
    readonly blurBtn: Locator;
    readonly hideTimerBtn: Locator;
    readonly exitBtn: Locator;

    constructor(public readonly page: Page) {
        this.img = this.page.getByRole("img");
        this.prevBtn = this.page.getByRole("button", { name: "Previous" });
        this.nextBtn = this.page.getByRole("button", { name: "Next" });
        this.pauseBtn = this.page.getByRole("button", { name: "Pause" });
        this.resumeBtn = this.page.getByRole("button", { name: "Resume" });
        this.resetZoomBtn = this.page.getByRole("button", { name: "Reset zoom" });
        this.zoomOutBtn = this.page.getByRole("button", { name: "Zoom out" });
        this.zoomInBtn = this.page.getByRole("button", { name: "Zoom in" });
        this.flipHorizontallyBtn = this.page.getByRole("button", { name: "Flip horizontally" });
        this.flipVerticallyBtn = this.page.getByRole("button", { name: "Flip vertically" });
        this.greyscaleBtn = this.page.getByRole("button", { name: "Greyscale" });
        this.contrastBtn = this.page.getByRole("button", { name: "Contrast" });
        this.blurBtn = this.page.getByRole("button", { name: "Blur" });
        this.hideTimerBtn = this.page.getByRole("button", { name: "Hide timer" });
        this.exitBtn = this.page.getByRole("button", { name: "Exit" });
    }

    // Can be used to reveal toolbar
    hoverImage = async () => {
        await this.img.hover();
    };

    exitSession = async () => {
        await this.hoverImage();
        await this.exitBtn.click();
        await this.page.getByRole("button", { name: "Yes" }).click();
        await this.page.waitForURL("/session/end");
    };
}
