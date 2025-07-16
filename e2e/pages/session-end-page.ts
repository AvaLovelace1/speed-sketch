import type { Locator, Page } from "@playwright/test";

export class SessionEndPage {
    readonly mainMenuBtn: Locator;

    constructor(public readonly page: Page) {
        this.mainMenuBtn = this.page.getByRole("button", { name: "Main Menu" });
    }

    goto = async () => {
        await this.page.goto("/session/end");
    };

    returnToMainMenu = async () => {
        await this.mainMenuBtn.click();
        await this.page.waitForURL("/");
    };
}
