<style lang="scss">
    @import "../../style/pages/explore";

    h1 {
        text-align: center;
    }
    div {
        height: 200vh;
        padding-top: 24px;
        text-align: center;
    }
</style>

<script lang="ts">
    // Components
    import PageTransition from '$components/PageTransition.svelte'
</script>

<svelte:head>
    <title>Photos</title>
</svelte:head>

<PageTransition name="explore">
    <h1>Photos</h1>
    <div>Basically a grid of photos</div>
</PageTransition>