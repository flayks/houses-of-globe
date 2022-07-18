<style lang="scss">
    @import "../../style/atoms/button-circle";
</style>

<script lang="ts">
    export let tag: string = 'button'
    export let url: string = undefined
    export let color: string = undefined
    export let size: string = undefined
    export let type: string = undefined
    export let clone: boolean = false
    export let disabled: boolean = undefined
    export let label: string = undefined

    const className = 'button-circle'
    const classes = [
        className,
        ...[color, size].map(variant => variant && `${className}--${variant}`),
        clone ? 'has-clone' : null,
        $$props.class
    ].join(' ').trim()
</script>

{#if tag === 'a'}
    <a href={url} class={classes} tabindex="0" aria-label={label} on:click>
        {#if clone}
            {#each Array(2) as _}
                <slot />
            {/each}
        {:else}
            <slot />
        {/if}
    </a>
{:else}
    <button {type} class={classes} disabled={disabled} tabindex="0" aria-label={label} on:click>
        {#if clone}
            {#each Array(2) as _}
                <slot />
            {/each}
        {:else}
            <slot />
        {/if}
    </button>
{/if}