<style lang="scss">
    @import "../../style/modules/globe2";
</style>

<script lang="ts">
    import { getContext, onMount } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { Globe, type Marker } from '$modules/globe2'
    import { getRandomItem, debounce } from '$utils/functions'
    // Components
    import Image from '$components/atoms/Image.svelte'

    let innerWidth: number
    let globeParentEl: HTMLElement, globeEl: HTMLElement
    let globe: any
    let observer: IntersectionObserver
    let animation: number
    let popinOpen: boolean = false
    let clusterLocations: Marker[] = []

    $: globeResolution = innerWidth > 1440 && window.devicePixelRatio > 1 ? '4k' : '2k'

    const { continents, locations } = getContext('global')
    const randomContinent: any = getRandomItem(continents)
    const markers = locations.map(({ name, slug, country, coordinates: { coordinates }}): Marker => ({
        name,
        slug,
        country: { ...country },
        lat: coordinates[1],
        lng: coordinates[0],
    }))


    onMount(() => {
        globe = new Globe({
            el: globeEl,
            parent: globeParentEl,
            mapFile: `/images/globe-map-${globeResolution}.png`,
            dpr: Math.min(Math.round(window.devicePixelRatio), 2),
            autoRotate: true,
            speed: 0.003,
            rotationStart: randomContinent.rotation,
            markers,
            pane: import.meta.env.DEV,
        })

        // TODO: Define cluster locations and position it
        clusterLocations = locations.filter((loc: any) => loc.country.slug === 'france')

        resize()

        // Render only if in viewport
        observer = new IntersectionObserver(entries => {
            entries.forEach(({ isIntersecting }: IntersectionObserverEntry) => {
                if (isIntersecting) {
                    update()
                    console.log('render globe2')
                } else {
                    stop()
                    console.log('stop globe2')
                }
            })
        }, {
            threshold: 0,
            rootMargin: '0px 0px 0px'
        })
        observer.observe(globeEl)


        // Destroy
        return () => {
            destroy()
        }
    })


    /**
     * Methods
     */
    // Update
    const update = () => {
        animation = requestAnimationFrame(update)
        globe.render()
    }

    // Stop
    const stop = () => {
        cancelAnimationFrame(animation)
    }

    // Resize
    const resize = debounce(() => {
        globe.resize()
    }, 100)

    // Destroy
    const destroy = () => {
        stop()
        globe.destroy()
    }
</script>

<svelte:window
    on:resize={resize}
/>

<div class="globe" bind:this={globeParentEl}>
    <div class="globe__inner">
        <div class="globe__canvas" bind:this={globeEl} />
    </div>

    <ul class="globe__markers">
        {#each markers as { name, slug, country, lat, lng }}
            <li class="globe__marker" data-location={slug} data-lat={lat} data-lng={lng}>
                <a href="/{country.slug}/{slug}" sveltekit:noscroll>
                    <dl>
                        <dt class="title-small">{name}</dt>
                        <dd class="text-label text-label--small">{country.name}</dd>
                    </dl>
                </a>
            </li>
        {/each}

        <li class="globe__cluster">
            <button on:click={() => popinOpen = !popinOpen} aria-label="{popinOpen ? 'Close' : 'Open'} cluster" />
        </li>
    </ul>

    {#if popinOpen}
        <div class="globe__popin" transition:fly={{ y: 16, duration: 500, easing: quartOut }}>
            <ul>
                {#each clusterLocations as { name, slug, country }, index (slug)}
                    <li in:fade={{ duration: 400, delay: 200 + (50 * index) }}>
                        <a href="/{country.slug}/{slug}" sveltekit:noscroll tabindex="0">
                            <!-- <Image
                                class="flag"
                                id={country.flag.id}
                                sizeKey="square-small"
                                width={32} height={32}
                                alt="Flag of {country.name}"
                            /> -->
                            <dl>
                                <dt class="title-small">{name}</dt>
                                <dd class="text-label text-label--small">{country.name}</dd>
                            </dl>
                        </a>
                    </li>
                {/each}
            </ul>
            <button class="close" aria-label="Close" on:click={() => popinOpen = false}>
                <svg width="9" height="9">
                    <use xlink:href="#cross" />
                </svg>
            </button>
        </div>
    {/if}
</div>