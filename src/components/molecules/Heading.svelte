<style lang="scss">
    @import "../../style/molecules/heading";
</style>

<script lang="ts">
    import SiteTitle from '$components/atoms/SiteTitle.svelte'

    export let text: string
</script>

<section class="heading">
    <SiteTitle variant="inline" />

    <p class="text-medium">
        {text}
    </p>
</section>