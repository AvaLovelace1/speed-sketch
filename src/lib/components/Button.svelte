<script lang="ts">
    interface Props {
        label: string;
        color?: string;
    }

    const {label, color = ''}: Props = $props();
    const colorClass = color ? `btn-${color}` : '';
</script>

<button type="button" class="btn {colorClass}">{label}</button>
