<style lang="scss">
    @import "../../style/pages/subscribe";
</style>

<script lang="ts">
    import { onMount } from 'svelte'
    import anime, { type AnimeTimelineInstance } from 'animejs'
    // Components
    import PageTransition from '$components/PageTransition.svelte'
    import InteractiveGlobe2 from '$components/organisms/InteractiveGlobe2.svelte'


    onMount(() => {
        /**
         * Animations
         */
        // Setup animations
        const timeline: AnimeTimelineInstance = anime.timeline({
            duration: 1600,
            easing: 'easeOutQuart',
            autoplay: false,
        })

        anime.set('.subscribe__top > *, .subscribe__issues', {
            opacity: 0,
            translateY: 24,
        })

        // Elements
        timeline.add({
            targets: '.subscribe__top > *, .subscribe__issues',
            opacity: 1,
            translateY: 0,
            delay: anime.stagger(200),
        }, 500)

        // Reveal each issue
        timeline.add({
            targets: '.subscribe__issues .issue',
            opacity: [0, 1],
            translateY: [16, 0],
            delay: anime.stagger(150),
            duration: 1000,
        }, 1000)

        // Transition in
        requestAnimationFrame(timeline.play)
    })
</script>

<svelte:head>
    <title>Cropped Globe</title>
</svelte:head>

<PageTransition name="subscribe">
    <InteractiveGlobe2 type="cropped" />
</PageTransition>