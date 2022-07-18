<style lang="scss">
    @import "../style/pages/subscribe";
</style>

<script lang="ts">
    import { onMount } from 'svelte'
    import anime, { type AnimeTimelineInstance } from 'animejs'
    // Components
    import PageTransition from '$components/PageTransition.svelte'
    import Heading from '$components/molecules/Heading.svelte'
    import EmailForm from '$components/molecules/EmailForm.svelte'
    import InteractiveGlobe2 from '$components/organisms/InteractiveGlobe2.svelte'

    export let data: any


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
    <title>Subscribe</title>
</svelte:head>

<PageTransition name="subscribe">
    <div class="subscribe__top">
        <Heading
            text="Sign up below if you wish to be notified when new photos or locations are added and limited prints become available on our shop."
        />

        <EmailForm />
    </div>

    <InteractiveGlobe2 type="cropped" />
</PageTransition>