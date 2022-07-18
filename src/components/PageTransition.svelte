<script lang="ts">
    import { page } from '$app/stores'
    import { fade } from 'svelte/transition'
    import { scrollToTop } from '$utils/functions'
    import { DURATION } from '$utils/contants'

    export let name: string

    $: doNotScroll = !$page.url.searchParams.get('country') && !$page.url.pathname.includes('/shop/')
</script>

<main class={name}
    in:fade={{ duration: DURATION.PAGE_IN, delay: DURATION.PAGE_DELAY }}
    out:fade={{ duration: DURATION.PAGE_OUT }}
    on:outroend={() => doNotScroll && scrollToTop()}
>
    <slot />
</main>