<script lang="ts">
    const colors = [
        {
            name: "Base-100",
            class_: "bg-base-100 text-base-content",
        },
        {
            name: "Base-200",
            class_: "bg-base-200 text-base-content",
        },
        {
            name: "Base-300",
            class_: "bg-base-300 text-base-content",
        },
        {
            name: "Primary",
            class_: "bg-primary text-primary-content",
        },
        {
            name: "Secondary",
            class_: "bg-secondary text-secondary-content",
        },
        {
            name: "Accent",
            class_: "bg-accent text-accent-content",
        },
        {
            name: "Neutral",
            class_: "bg-neutral text-neutral-content",
        },
        {
            name: "Info",
            class_: "bg-info text-info-content",
        },
        {
            name: "Success",
            class_: "bg-success text-success-content",
        },
        {
            name: "Warning",
            class_: "bg-warning text-warning-content",
        },
        {
            name: "Error",
            class_: "bg-error text-error-content",
        },
    ];
</script>

<div class="flex flex-wrap gap-2">
    {#each colors as { name, class_ } (name)}
        <div class="flex size-32 items-center justify-center rounded {class_}">
            <div class="text-center">
                <p class="text-xl font-bold">{name}</p>
                <p>{name}</p>
            </div>
        </div>
    {/each}
</div>
