<script lang="ts">
    import '../style/global.scss'

    import { navigating, page } from '$app/stores'
    import { beforeNavigate } from '$app/navigation'
    import { onMount, setContext } from 'svelte'
    import { pageLoading, previousPage } from '$utils/stores'
    import { DURATION } from '$utils/contants'
    import '$utils/polyfills'
    // Components
    import SVGSprite from '$components/SVGSprite.svelte'

    export let data: any

    setContext('global', data)

    const tempNavLinks = [
        { url: '/', text: 'Homepage', globe: 'Full Globe v2' },
        { url: '/v1', text: 'Homepage', globe: 'Globe v1' },
        { url: '/photos', text: 'Photos', globe: 'No Globe' },
        { url: '/subscribe', text: 'Subscribe', globe: 'Cropped Globe v2' },
    ]

    /**
     * On page change
     */
    // Store previous page (for photo Viewer close button)
    beforeNavigate(({ from }) => {
        $previousPage = from.pathname
    })

    // Define page loading from navigating store
    navigating.subscribe((store: any) => {
        if (store) {
            $pageLoading = true

            // Turn page loading when changing page
            setTimeout(() => {
                $pageLoading = false
            }, DURATION.PAGE_IN * 1.25)
        }
    })

    onMount(() => {
        // Avoid FOUC
        document.body.style.opacity = '1'
    })
</script>

<nav class="temp-nav">
    <ul>
        {#each tempNavLinks as { url, text, globe }}
            <li class:is-active={url === $page.url.pathname}>
                <a href={url} data-sveltekit-noscroll>
                    <strong>{text}</strong>
                    <span>{globe}</span>
                </a>
            </li>
        {/each}
    </ul>
</nav>

<slot />

{#if $pageLoading}
    <div class="page-loading" />
{/if}

<SVGSprite />