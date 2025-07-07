import type { LayoutLoad } from "./$types";
import { goto } from "$app/navigation";
import { base } from "$app/paths";
import { currentSession } from "$lib/drawing-session.svelte";

export const load: LayoutLoad = async () => {
    if (!currentSession.object.isValid()) {
        console.error("Invalid drawing session, redirecting to main menu.");
        await goto(`${base}/`, { replaceState: true });
    }
};
