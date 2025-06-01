<script lang="ts">
    interface Props {
        label: string;
        class_?: string;
        href?: string | null;
    }

    const {label, class_ = '', href = null}: Props = $props();
</script>

{#if href}
    <a {href} role="button" class="btn {class_}">{label}</a>
{:else}
    <button type="button" class="btn {class_}">{label}</button>
{/if}
