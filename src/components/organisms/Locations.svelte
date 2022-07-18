<style lang="scss">
    @import "../../style/organisms/locations";
</style>

<script lang="ts">
    import { getContext } from 'svelte'
    import { flip } from 'svelte/animate'
    import { quartOut } from 'svelte/easing'
    import { reveal, fly } from '$animations/index'
    import { send, receive } from '$animations/crossfade'
    import { throttle } from '$utils/functions'
    // Components
    import Button from '$components/atoms/Button.svelte'
    import Location from '$components/molecules/Location.svelte'

    export let locations: any[]

    const { continents } = getContext('global')

    // Continents filtering logic
    let currentContinent: string = undefined

    $: filteredLocations = locations.filter(({ country: { continent }}: any) => {
        if (!currentContinent) {
            // Show all locations by default
            return true
        } else {
            // Location's continent matches the clicked continent
            return continent.slug === currentContinent
        }
    })


    /**
     * Filter locations from continent
     */
    const filterLocation = throttle((continent: string) => {
        currentContinent = continent !== currentContinent ? continent : null
    }, 600)
</script>

<div class="browse" id="locations">
    <div class="browse__description">
        <p>Browse all the cities and countries</p>
    </div>

    <ul class="browse__continents">
        {#each continents as { name, slug }}
            <li class:is-active={currentContinent === slug}>
                <Button
                    tag="button" text={name} size="small"
                    slotPosition="after"
                    class={'is-disabled'}
                    on:click={() => {
                        filterLocation(slug)
                        sendEvent({ action: 'filterContinent' })
                    }}
                >
                    <svg width="12" height="12">
                        <use xlink:href="#cross" />
                    </svg>
                </Button>
            </li>
        {/each}
    </ul>

    <ul class="browse__locations"
        use:reveal={{
            animation: fly,
            options: {
                children: 'li',
                stagger: 100,
                duration: 1200,
                from: '20%',
            },
            threshold: 0.3,
        }}
    >
        {#each filteredLocations as location (location)}
            <li
                animate:flip={{ duration: 1000, easing: quartOut }}
                in:receive={{ key: location.slug }}
                out:send={{ key: location.slug }}
            >
                <Location
                    location={location}
                />
            </li>
        {/each}
    </ul>
</div>