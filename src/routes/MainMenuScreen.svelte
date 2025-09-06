<script lang="ts">
    import { slide } from "$lib/motion.svelte";
    import { Separator, Button } from "bits-ui";
    import type { Image } from "$lib/types.svelte";
    import CenteredFull from "$lib/utilities/CenteredFull.svelte";
    import Link from "$lib/utilities/Link.svelte";
    import Card from "$lib/components/Card.svelte";
    import Checkbox from "$lib/components/input/Checkbox.svelte";
    import DurationField from "$lib/components/input/DurationField.svelte";
    import ImageDropzone from "$lib/components/dropzone/ImageDropzone.svelte";
    import RadioButtons from "$lib/components/input/RadioButtons.svelte";
    import SettingsButton from "$lib/components/SettingsButton.svelte";
    import { SessionSettings } from "$lib/store/session-settings.svelte";
    import { isTauri as isTauriFn } from "@tauri-apps/api/core";
    import SchedulerInput from "$lib/components/input/SchedulerInput.svelte";

    const APP_NAME = "SpeedSketch";
    const TAGLINE = "timed drawing sessions";
    const VERSION = "2.1.0";
    const COPYRIGHT = "© 2024–2025 Ava Pun";
    const GITHUB_URL = "https://github.com/AvaLovelace1/speed-sketch";
    const ISSUE_URL = `${GITHUB_URL}/issues/new`;
    const BUG_REPORT_URL = `${ISSUE_URL}?template=bug_report.md`;
    const FEATURE_REQUEST_URL = `${ISSUE_URL}?template=feature_request.md`;

    export interface Props {
        sessionSettings: SessionSettings;

        imgs?: Image[];
        imgErrMsg?: string;
        isLoadingImgs?: boolean;
        onImgsInput?: (inputImgsOrFolder: string | Image[] | null) => Promise<void>;

        canStartSession?: boolean;
        startSession?: () => Promise<void>;

        isTauri?: boolean;
    }

    let {
        sessionSettings = new SessionSettings(),
        imgs = [],
        imgErrMsg = "",
        isLoadingImgs = $bindable(false),
        onImgsInput = async (_) => {},
        canStartSession = false,
        startSession = async () => {},
        isTauri = isTauriFn(),
    }: Props = $props();

    const sessionModeOptions = sessionSettings.SESSION_MODES.map((sessionMode) => ({
        label: sessionMode.name,
        value: sessionMode.name,
        description: sessionMode.description,
    }));

    const imgShowTimeOptions = sessionSettings.IMG_SHOW_TIME_OPTIONS.map((option) => ({
        label: option,
        value: option,
    }));

    let schedule = $state(sessionSettings.sessionScheduleCustom);
</script>

<CenteredFull>
    <div class="px-2 py-8">
        {@render header()}
        {@render form()}
        {@render footer()}
        <SettingsButton />
    </div>
</CenteredFull>

{#snippet header()}
    <header class="mb-8 text-center">
        <h1 class="text-6xl font-thin">{APP_NAME}</h1>
        <Separator.Root class="divider mt-3 text-lg tracking-widest text-muted">
            {TAGLINE}
        </Separator.Root>
    </header>
{/snippet}

{#snippet form()}
    <main class="mb-8">
        <Card>
            <form
                class="w-lg"
                onsubmit={async (e) => {
                    e.preventDefault();
                    await startSession();
                }}
            >
                <div class="p-8 pb-12">
                    <div class="mb-6">
                        <div class="mb-2 flex items-baseline justify-between">
                            <div class="cursor-default text-sm text-muted">Images</div>
                            <div class="flex gap-3">
                                {#if isTauri}
                                    <Checkbox
                                        label="Include subfolders"
                                        bind:checked={sessionSettings.includeSubfolders}
                                        onCheckedChange={async (_) => await onImgsInput(null)}
                                    />
                                {/if}
                                <Checkbox
                                    label="Shuffle"
                                    bind:checked={sessionSettings.shuffleImgs}
                                    onCheckedChange={async (_) => await onImgsInput(null)}
                                />
                            </div>
                        </div>
                        <ImageDropzone
                            {imgs}
                            folder={sessionSettings.imgFolder}
                            bind:isLoading={isLoadingImgs}
                            errMsg={imgErrMsg}
                            onInput={onImgsInput}
                            {isTauri}
                        />
                    </div>
                    <RadioButtons
                        class="mb-1 flex"
                        groupLabel="Session mode"
                        items={sessionModeOptions}
                        bind:group={sessionSettings.sessionMode}
                        buttonStyle="large"
                        required
                    />
                    <Separator.Root class="divider" />
                    {#if sessionSettings.sessionMode === "Endless"}
                        <RadioButtons
                            class="mb-4 flex"
                            groupLabel="Time per image"
                            items={imgShowTimeOptions}
                            bind:group={sessionSettings.imgShowTimeOption}
                            required
                        />
                        {#if sessionSettings.imgShowTimeOption === "Custom"}
                            <div
                                class="flex justify-center"
                                in:slide={{ duration: "long" }}
                                out:slide={{ duration: "medium" }}
                            >
                                <DurationField bind:seconds={sessionSettings.imgShowTimeCustom} />
                            </div>
                        {/if}
                    {/if}
                    {#if sessionSettings.sessionMode === "Class"}
                        <SchedulerInput bind:schedule />
                    {/if}
                </div>
                <Button.Root
                    type="submit"
                    class="btn btn-block rounded-t-none rounded-b-box p-6 text-lg font-semibold uppercase btn-success"
                    disabled={!canStartSession}
                >
                    <span class="iconify lucide--play"></span>Go!
                </Button.Root>
            </form>
        </Card>
    </main>
{/snippet}

{#snippet footer()}
    <footer class="text-center text-sm text-muted">
        <p>
            <Link href={BUG_REPORT_URL} external>
                report <strong class="font-semibold">bug</strong>
            </Link>
            &nbsp;•&nbsp;
            <Link href={FEATURE_REQUEST_URL} external>
                request <strong class="font-semibold">feature</strong>
            </Link>
        </p>
        <p><small class="text-xxs">{COPYRIGHT} &nbsp;•&nbsp; v{VERSION}</small></p>
    </footer>
{/snippet}
