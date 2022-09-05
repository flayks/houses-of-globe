<style lang="scss">
    @import "../../style/molecules/location";
</style>

<script lang="ts">
    import { getContext } from 'svelte'
    import { spring } from 'svelte/motion'
    import dayjs from 'dayjs'
    import { lerp } from '$utils/functions'
    // Components
    import Image from '$components/atoms/Image.svelte'
    import Badge from '$components/atoms/Badge.svelte'

    export let location: any
    // export let latestPhoto: any

    const limit_new = 30

    let locationEl: HTMLElement
    let photoIndex = 0

    // Location date limit
    let isNew = false
    let dateUpdated: dayjs.Dayjs
    const dateNowOffset = dayjs().subtract(limit_new, 'day')


    /**
     * Moving cursor over
     */
    const offset = spring({ x: 0, y: 0 }, {
		stiffness: 0.075,
		damping: 0.9
	})
    const handleMouseMove = ({ clientX }: MouseEvent) => {
        const { width, left } = locationEl.getBoundingClientRect()
        const moveProgress = (clientX - left) / width // 0 to 1

        // Move horizontally
        offset.update(_ => ({
            x: lerp(-56, 56, moveProgress),
            y: 0
        }))

        // Change photo index from mouse position percentage
        photoIndex = Math.round(lerp(0, Number(import.meta.env.VITE_PREVIEW_COUNT) - 1, moveProgress))
    }

    // Leaving mouseover
    const handleMouseLeave = () => {
        offset.update($c => ({
            x: $c.x,
            y: 40
        }))
    }
</script>

<div class="location" bind:this={locationEl}
    style="--offset-x: {$offset.x}px; --offset-y: {$offset.y}px; --rotate: {$offset.x * 0.125}deg"
>
    <a href="/{location.country.slug}/{location.slug}"
        on:mousemove={handleMouseMove}
        on:mouseleave={handleMouseLeave}
        data-sveltekit-noscroll
        tabindex="0"
    >
        <div class="text">
            <dl>
                <dt class="location__name">
                    {location.name}
                </dt>
                <dd class="location__country text-label">
                    {location.country.name}
                </dd>
            </dl>
            {#if isNew}
                <Badge text="New" />
            {/if}
        </div>
    </a>
</div>
