<style lang="scss">
    @import "../../style/modules/globe";
</style>

<script lang="ts">
    import { onMount, getContext } from 'svelte'
    import { getPosition, getRandomItem } from '$utils/functions'

    export let type: string = undefined
    export let autoRotate: boolean = true
    export let scrollSmooth: number = 0.5
    export let opacity: number = 1

    let InteractiveGlobe: any
    let globeEl: HTMLElement
    let observer: IntersectionObserver
    let globe: any
    let innerWidth: number
    let innerHeight: number
    let containerTop = 0
    let containerHeight = 0

    $: globeResolution = innerWidth > 1440 && window.devicePixelRatio > 1 ? '4k' : '2k'

    const { continents, locations } = getContext('global')
    const randomContinent: any = getRandomItem(continents.filter((cont: any) => cont.countries))
    const markers = locations.map(({ name, slug, country, globe_close: isClose, coordinates: { coordinates }}: any) => ({
        name,
        slug,
        countryName: country.name,
        countrySlug: country.slug,
        lat: coordinates[1],
        lng: coordinates[0],
        className: isClose ? 'is-close' : '',
    }))


    /*
    ** Functions
    */
    // Globe update
    const update = () => {
        requestAnimationFrame(update)
        globe.update()
    }

    // On scroll
    const handleScroll = () => {
        let scrollDiff = (containerTop + innerHeight + (containerHeight - innerHeight) / 2) - document.documentElement.scrollTop
        let scrollRatio = (1 - (scrollDiff / innerHeight)) * 2
        if (globe) {
            globe.updateCameraPos(scrollRatio, scrollDiff - innerHeight)
        }
    }

    // On resize
    const handleResize = () => {
        if (globeEl && globe) {
            containerTop = getPosition(globeEl).top
            containerHeight = globeEl.clientHeight

            requestAnimationFrame(() => {
                globe.resize()
                globe.update()
                handleScroll()
            })
        }
    }


    /*
    ** Run code when mounted
    */
    onMount(async () => {
        // Import libraries and code
        const { default: InteractiveGlobe } = await import('$modules/globe')

        // Init the globe from library
        globe = new InteractiveGlobe({
            el: globeEl,
            //cameraDistance: size, // Smaller number == larger globe
            autoRotationSpeed: autoRotate ? -0.0025 : 0,
            rotationStart: randomContinent.rotation, // In degrees
            scrollSmoothing: scrollSmooth,
            opacity: opacity,
            texture: `/images/globe-map-${globeResolution}.png`,
            markers,
            onLinkClicked: () => {}
        })

        // Run the globe
        update()
        setTimeout(() => {
            handleResize()
            handleScroll()
        }, 1000)


        // Enable/Disable the globe when shown/hidden
        const globeCanvas = document.querySelector('.globe-canvas')

        observer = new IntersectionObserver(entries => {
            entries.forEach(({ isIntersecting }: IntersectionObserverEntry) => {
                if (isIntersecting) {
                    globe.enable()
                    globeCanvas.classList.remove('is-hidden')
                } else {
                    globe.disable()
                    globeCanvas.classList.add('is-hidden')
                }
            })
        }, {
            threshold: 0,
            rootMargin: '0px 0px 0px'
        })
        observer.observe(globeEl)


        // Destroy
        return () => {
            globe && globe.destroy()
        }
    })
</script>

<svelte:window
    on:scroll={handleScroll}
    on:resize={handleResize}
    bind:innerHeight
    bind:innerWidth
/>


<section id="globe">
    {#if type === 'cropped'}
        <div class="globe-cropped">
            <div class="globe" bind:this={globeEl} />
        </div>
    {:else}
        <div class="globe" bind:this={globeEl} />
    {/if}
</section>