<style lang="scss">
    @import "../../style/atoms/button";
</style>

<script lang="ts">
    import SplitText from '$components/SplitText.svelte'

    export let tag: string = 'a'
    export let text: string
    export let url: string = undefined
    export let color: string = undefined
    export let size: string = undefined
    export let effect: string = 'link-3d'
    export let disabled: boolean = undefined
    export let slotPosition: string = 'before'

    const className = 'button'
    const classes = [
        className,
        effect ? effect : undefined,
        ...[color, size].map(variant => variant && `${className}--${variant}`),
        $$slots ? `has-icon-${slotPosition}` : undefined,
        $$props.class
    ].join(' ').trim()

    // Define external links
    let rel: string, target: string
    $: isExternal = /(http(s?)):\/\//i.test(url)
    $: rel = isExternal ? 'external noopener noreferrer' : null
    $: target = isExternal ? '_blank' : null
</script>

{#if tag === 'button'}
    <button class={classes} tabindex="0" {disabled} on:click>
        {#if slotPosition === 'before'}
            <slot />
        {/if}
        <SplitText {text} clone={true} />
        {#if slotPosition === 'after'}
            <slot />
        {/if}
    </button>
{:else if tag === 'a'}
    <a
        href={url} class={classes}
        {rel} {target}
        sveltekit:prefetch={url && isExternal ? null : true}
        sveltekit:noscroll={isExternal ? null : true}
        {disabled}
        tabindex="0"
        on:click
    >
        {#if slotPosition === 'before'}
            <slot />
        {/if}
        <SplitText {text} clone={true} />
        {#if slotPosition === 'after'}
            <slot />
        {/if}
    </a>
{/if}