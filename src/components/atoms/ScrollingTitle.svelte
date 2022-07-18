<style lang="scss">
    :global(.scrolling-title) {
        transform: translate3d(var(--parallax-x), 0, 0);
        transition: transform 1.2s var(--ease-quart);
        will-change: transform;
    }
</style>

<script lang="ts">
    import { map } from '$utils/functions'
    import { reveal, fly } from '$animations/index'

    export let tag: string
    export let label: string = undefined
    export let parallax: number = undefined
    export let offsetStart: number = undefined
    export let offsetEnd: number = undefined
    export let animate: boolean = true

    let scrollY: number
    let innerWidth: number
    let innerHeight: number
    let titleEl: HTMLElement
    let isLarger: boolean

    // Define default values
    $: if (titleEl && !offsetStart && !offsetEnd) {
        offsetStart = titleEl.offsetTop - innerHeight * 0.75
        offsetEnd = titleEl.offsetTop + innerHeight * 0.25
    }

    // Check if title is larger than viewport to translate it
    $: isLarger = titleEl && titleEl.offsetWidth >= innerWidth

    // Calculate the parallax value
    $: if (titleEl) {
        const toTranslate = 100 - innerWidth / titleEl.offsetWidth * 100
        parallax = isLarger ? map(scrollY, offsetStart, offsetEnd, 0, -toTranslate, true) : 0
    }

    $: classes = [
        'scrolling-title',
        'title-huge',
        $$props.class
    ].join(' ').trim()


    const revealOptions = animate ? {
        animation: fly,
        options: {
            children: '.char',
            stagger: 60,
            duration: 1600,
            from: '-105%',
            opacity: false,
            delay: 200,
        },
        threshold: 0.2,
    } : {}
</script>

<svelte:window
    bind:scrollY
    bind:innerWidth bind:innerHeight
/>

<svelte:element this={tag}
    bind:this={titleEl}
    class={classes} aria-label={label}
    style="--parallax-x: {parallax}%;"
    use:reveal={revealOptions}
>
    <slot />
</svelte:element>