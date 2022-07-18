<style lang="scss">
    @import "../../style/atoms/site-title";
</style>

<script lang="ts">
    import SplitText from '$components/SplitText.svelte'
    import { reveal, fly } from '$animations/index'
    import { DURATION } from '$utils/contants'

    export let variant: string = 'lines'
    export let tag: string = 'h1'
</script>

{#if tag === 'h1'}
    <h1 class="site-title site-title--{variant}"
        use:reveal={{
            animation: fly,
            options: {
                children: '.char',
                stagger: 40,
                duration: 1000,
                from: '110%',
                opacity: false,
                delay: DURATION.PAGE_IN
            },
            threshold: 0,
        }}
    >
        <SplitText text="Houses" mode="chars" class="pink mask" />
        <SplitText text="Of The" mode="chars" class="middle mask" />
        <SplitText text="World" mode="chars" class="pink mask" />
    </h1>
{:else}
    <div class="site-title site-title--{variant}">
        <span class="word-1">Houses</span>
        <span class="middle word-2">Of The</span>
        <span class="word-3">World</span>
    </div>
{/if}