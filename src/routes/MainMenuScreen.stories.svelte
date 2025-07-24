<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import MainMenuScreen from "./MainMenuScreen.svelte";
    import type { Props as MainMenuScreenProps } from "./MainMenuScreen.svelte";
    import { Tooltip } from "bits-ui";
    import { SessionSettings } from "$lib/store/session-settings.svelte";
    import Sample1 from "$lib/assets/images/pexels-by-hong-son.jpg";
    import Sample2 from "$lib/assets/images/pexels-by-sasha-kim.jpg";
    import Sample3 from "$lib/assets/images/pexels-by-andrew-sindt.jpg";
    import { fn, expect } from "storybook/test";

    const img1 = { name: "img1.jpg", url: Sample1 };
    const img2 = { name: "img2.jpg", url: Sample2 };
    const img3 = { name: "img3.jpg", url: Sample3 };

    const { Story } = defineMeta({
        title: "Screens/MainMenuScreen",
        component: MainMenuScreen,
        tags: ["autodocs"],
        render: template,
        args: {
            sessionSettings: new SessionSettings(),
            onImgsInput: fn(),
            startSession: fn(),
        },
    });
</script>

{#snippet template(args: MainMenuScreenProps)}
    <Tooltip.Provider>
        <MainMenuScreen {...args} />
    </Tooltip.Provider>
{/snippet}

<!-- The user sees this on first startup. -->
<Story name="Default" />

<!-- Loading images. -->
<Story name="Loading Images" args={{ isLoadingImgs: true, canStartSession: false }} />

<!-- More images loaded than can fit in the thumbnail grid. -->
<Story
    name="Many Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2, img3, img1, img2, img3],
        canStartSession: true,
    }}
/>

<!-- Enough images loaded to exactly fill the thumbnail grid. -->
<Story
    name="Some Images"
    args={{
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
    }}
/>

<!-- One image loaded. -->
<Story name="One Image" args={{ imgs: [img1], canStartSession: true }} />

<!-- Invalid image folder chosen. -->
<Story name="Invalid" args={{ imgErrMsg: "No images found", canStartSession: false }} />

<!-- The Tauri UI shows the shows the "include subfolders" checkbox, shows the folder name, and hides the "no upload" message. -->
<Story
    name="Tauri"
    args={{
        sessionSettings: new SessionSettings({
            imgFolder: "C:\\Users\\User\\Pictures",
        }),
        imgs: [img1, img2, img3, img1, img2, img3, img1, img2],
        canStartSession: true,
        isTauri: true,
    }}
/>

<!-- The folder name is red when invalid. -->
<Story
    name="Tauri Invalid"
    args={{
        sessionSettings: new SessionSettings({
            imgFolder: "C:\\Users\\User\\Pictures",
        }),
        imgErrMsg: "No images found",
        canStartSession: false,
        isTauri: true,
    }}
/>

<Story
    name="With Interactions"
    args={{ canStartSession: true }}
    play={async ({ args, canvas, userEvent, step }) => {
        await step("Toggle shuffle checkbox", async () => {
            const shuffleCheckbox = await canvas.findByRole("checkbox", { name: /shuffle/i });
            await userEvent.click(shuffleCheckbox);
            expect(args.sessionSettings.shuffleImgs).toBe(false);
            await userEvent.click(shuffleCheckbox);
            expect(args.sessionSettings.shuffleImgs).toBe(true);
        });

        await step("Select time of 1m", async () => {
            await userEvent.click(canvas.getByRole("radio", { name: /1m/i }));
            await expect(
                canvas.queryByRole("spinbutton", { name: /minute, custom time/i }),
            ).toBeNull();
            expect(args.sessionSettings.imgShowTime).toBe(60);
        });

        await step("Select custom time", async () => {
            await userEvent.click(canvas.getByRole("radio", { name: /custom/i }));
            const hourInput = await canvas.findByRole("spinbutton", { name: /hour, custom time/i });
            const minuteInput = await canvas.findByRole("spinbutton", {
                name: /minute, custom time/i,
            });
            const secondInput = await canvas.findByRole("spinbutton", {
                name: /second, custom time/i,
            });
            await userEvent.type(hourInput, "2");
            await userEvent.type(minuteInput, "30");
            await userEvent.type(secondInput, "15");
            expect(args.sessionSettings.imgShowTime).toBe(2 * 3600 + 30 * 60 + 15);
        });
    }}
/>
