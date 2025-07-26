<script lang="ts">
    import { Checkbox, Label } from "bits-ui";
    import { stringToId } from "$lib/utils.svelte.js";

    interface Props extends Checkbox.RootProps {
        label: string;
    }

    let { label, checked = $bindable(false), ...props }: Props = $props();

    const id = stringToId(`${label}-checkbox`);
</script>

<div class="inline-flex items-center gap-1">
    <Checkbox.Root
        {id}
        bind:checked
        tabindex={0}
        {...props}
        class={["checkbox rounded-sm checkbox-xs before:delay-0 before:duration-100", props.class]}
    />
    <Label.Root class="cursor-pointer text-xs text-muted" for={id}>
        {label}
    </Label.Root>
</div>
