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
        { url: '/', text: 'Homepage', globe: 'Full Globe' },
        { url: '/photos', text: 'Photos', globe: 'No globe' },
        { url: '/subscribe', text: 'Subscribe', globe: 'Cropped Globe' },
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
        {#each tempNavLinks as { url, text }}
            <li class:is-active={url === $page.url.pathname}>
                <a href={url} sveltekit:noscroll>
                    {text}
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


<script context="module" lang="ts">
    import type { LoadEvent, LoadOutput } from '@sveltejs/kit'

    export async function load ({ fetch }: LoadEvent): Promise<LoadOutput> {
        const res = await fetch('/data.json')
        const data = await res.json()
        const filteredContinents = data.continents.filter((cont: any) => cont.countries.length)

        if (res) {
            return {
                props: {
                    data: {
                        ...data,
                        continents: filteredContinents
                    }
                },
            }
        }

        return {
            status: 500,
        }
    }
</script>