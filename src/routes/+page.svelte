<style lang="scss">
    @import "../style/pages/homepage";
</style>

<script lang="ts">
    // Components
    import PageTransition from '$components/PageTransition.svelte'
    import InteractiveGlobe2 from '$components/organisms/InteractiveGlobe2.svelte'
</script>

<svelte:head>
    <title>Homepage</title>
</svelte:head>

<PageTransition name="homepage">
    <section class="homepage__locations">
        <InteractiveGlobe2 />
    </section>
</PageTransition>