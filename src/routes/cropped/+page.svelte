<script lang="ts">
    import PageTransition from '$components/PageTransition.svelte'
    import InteractiveGlobe2 from '$components/organisms/InteractiveGlobe2.svelte'
</script>

<svelte:head>
    <title>Cropped Globe</title>
</svelte:head>

<PageTransition name="subscribe">
    <InteractiveGlobe2 type="cropped" />
</PageTransition>