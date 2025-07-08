<script lang="ts">
    import { Checkbox, Label } from "bits-ui";

    interface Props extends Checkbox.RootProps {
        label: string;
    }

    let { label, checked = $bindable(false), ...props }: Props = $props();

    const id = label.replace(/\s+/g, "-");
</script>

<div class="inline-flex items-center gap-1">
    <Checkbox.Root
        {id}
        bind:checked
        tabindex={0}
        {...props}
        class={["checkbox checkbox-xs rounded-sm before:delay-0 before:duration-100", props.class]}
    />
    <Label.Root class="text-muted cursor-pointer text-xs" for={id}>
        {label}
    </Label.Root>
</div>
