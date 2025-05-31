<script lang="ts">
    interface Props {
        label: string;
        class_?: string;
    }

    const {label, class_ = ''}: Props = $props();
</script>

<button type="button" class="btn {class_}">{label}</button>
