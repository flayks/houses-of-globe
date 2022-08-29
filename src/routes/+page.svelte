<style lang="scss">
    @import "../style/pages/homepage";
</style>

<script lang="ts">
    import { getContext, onMount } from 'svelte'
    import anime, { type AnimeTimelineInstance } from 'animejs'
    import { DELAY } from '$utils/contants'
    import { sleep } from '$utils/functions'
    // Components
    import PageTransition from '$components/PageTransition.svelte'
    import SplitText from '$components/SplitText.svelte'
    import ScrollingTitle from '$components/atoms/ScrollingTitle.svelte'
    import DiscoverText from '$components/atoms/DiscoverText.svelte'
    import InteractiveGlobe2 from '$components/organisms/InteractiveGlobe2.svelte'
    import Locations from '$components/organisms/Locations.svelte'

    const { locations }: any = getContext('global')

    let scrollY: number, innerHeight: number
    let timeline: AnimeTimelineInstance


    onMount(() => {
        timeline = anime.timeline({
            duration: 1600,
            easing: 'easeOutQuart',
            autoplay: false,
        })

        // Reveal text
        timeline.add({
            targets: '.homepage__headline',
            translateY: [16, 0],
            opacity: [0, 1],
        }, 750)

        // Animate collage photos
        timeline.add({
            targets: '.collage .photo-card',
            translateY: ['33.33%', 0],
            rotate (item: HTMLElement) {
                return [-4, getComputedStyle(item).getPropertyValue('--rotation')]
            },
            opacity: [0, 1],
            duration: 1200,
            delay: anime.stagger(75),
        }, 0)

        sleep(DELAY.PAGE_LOADING).then(timeline.play)
    })
</script>

<svelte:window bind:scrollY bind:innerHeight />
<svelte:head>
    <title>Homepage</title>
</svelte:head>

<PageTransition name="homepage">
    <div class="homepage__ctas" id="ctas">
        <DiscoverText />
    </div>

    <section class="homepage__locations">
        <InteractiveGlobe2 />

        <ScrollingTitle tag="p" class="title-world mask">
            <SplitText text="World" mode="chars" />
        </ScrollingTitle>

        <Locations {locations} />
    </section>
</PageTransition>