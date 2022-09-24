<style lang="scss">
    @import "../../style/modules/globe2";
</style>

<script lang="ts">
    import { getContext, onMount } from 'svelte'
    import { fade, fly as flySvelte } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { Globe, type Marker } from '$modules/globe2'
    import { getRandomItem, debounce } from '$utils/functions'
    import { fly, reveal } from '$animations'
    // Components
    import SplitText from '$components/SplitText.svelte'

    export let type: string = undefined
    export let enableMarkers: boolean = true
    export let speed: number = 0.1
    export let pane: boolean = import.meta.env.DEV
    export let width: number = undefined

    let innerWidth: number
    let globeParentEl: HTMLElement, globeEl: HTMLElement
    let globe: any
    let observer: IntersectionObserver
    let animation: number
    let hoveredMarker: { name: string, country: string } = null

    const { continents, locations }: any = getContext('global')
    const randomContinent: any = getRandomItem(continents)
    const markers = locations.map(({ name, slug, country, coordinates: { coordinates }}): Marker => ({
        name,
        slug,
        country: { ...country },
        lat: coordinates[1],
        lng: coordinates[0],
    }))


    onMount(() => {
        const globeResolution = innerWidth > 1440 && window.devicePixelRatio > 1 ? 4 : 2

        globe = new Globe({
            el: globeEl,
            parent: globeParentEl,
            mapFile: `/images/globe-map-${globeResolution}k.png`,
            mapFileDark: `/images/globe-map-dark-${globeResolution}k.png`,
            dpr: Math.min(Math.round(window.devicePixelRatio), 2),
            autoRotate: true,
            speed,
            sunAngle: 2,
            rotationStart: randomContinent.rotation,
            enableMarkers,
            markers,
            pane,
        })

        resize()

        // Render only if in viewport
        observer = new IntersectionObserver(([{ isIntersecting }]) => {
            if (isIntersecting) {
                update()
                console.log('render globe2')
            } else {
                stop()
                console.log('stop globe2')
            }
        }, { threshold: 0 })
        observer.observe(globeEl)


        // Destroy
        return () => {
            destroy()
            observer && observer.disconnect()
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

<svelte:window bind:innerWidth
    on:resize={resize}
/>

<div class="globe" bind:this={globeParentEl}
    class:is-cropped={type === 'cropped'}
    style:--width={width ? `${width}px` : null}
>
    <div class="globe__canvas" bind:this={globeEl}
        class:is-faded={hoveredMarker}
    >
        {#if enableMarkers}
            <ul class="globe__markers">
                {#each markers as { name, slug, country, lat, lng }}
                    <li class="globe__marker" data-location={slug} data-lat={lat} data-lng={lng}>
                        <a href="/{country.slug}/{slug}" data-sveltekit-noscroll
                            on:mouseenter={() => hoveredMarker = { name, country: country.name }}
                            on:mouseleave={() => hoveredMarker = null}
                        >
                            <i />
                            <span>{name}</span>
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>

    {#if hoveredMarker}
        <div class="globe__location"
            out:fade={{ duration: 300, easing: quartOut }}
            use:reveal={{
                animation: fly,
                options: {
                    children: '.char',
                    stagger: 40,
                    duration: 1000,
                    from: '110%',
                    opacity: false,
                },
                threshold: 0,
            }}
        >
            <SplitText text={hoveredMarker.name} mode="chars" class="name" />
            <p class="country" in:flySvelte={{ y: 16, duration: 800, easing: quartOut, delay: 900 }}>
                {hoveredMarker.country}
            </p>
        </div>
    {/if}
</div>