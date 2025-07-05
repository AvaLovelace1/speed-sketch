import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class SettingsDialog {
    readonly settingsBtn: Locator;
    readonly themeBtn: Locator;
    readonly volumeSlider: Locator;
    readonly contrastSlider: Locator;
    readonly blurSlider: Locator;
    readonly closeBtn: Locator;

    constructor(public readonly page: Page) {
        this.settingsBtn = this.page.getByRole("button", { name: "Settings" });
        this.themeBtn = this.page.getByRole("button", { name: "Theme" });
        this.volumeSlider = this.page.getByRole("slider", { name: "Volume" });
        this.contrastSlider = this.page.getByRole("slider", { name: "Contrast" });
        this.blurSlider = this.page.getByRole("slider", { name: "Blur" });
        this.closeBtn = this.page.getByRole("button", { name: "Close" });
    }

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
}
