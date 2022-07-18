<script lang="ts">
    export let src: string = undefined
    export let id: string = undefined
    export let sizeKey: string = undefined
    export let sizes: Sizes = undefined
    export let width: number = sizes && sizes.medium && sizes.medium.width
    export let height: number = sizes && sizes.medium && sizes.medium.height
    export let ratio: number = undefined
    export let alt: string
    export let lazy: boolean = true

    interface Sizes {
        small?: { width?: number, height?: number }
        medium?: { width?: number, height?: number }
        large?: { width?: number, height?: number }
    }

    let srcSet = { webp: [], jpg: [] }


    /**
     * Define height from origin ratio if not defined
     */
    const setHeightFromRatio = (w: number, r: number = ratio) => {
        return Math.round(w / r)
    }

    if (ratio && !height) {
        // Set height from width using ratio
        height = setHeightFromRatio(width)

        // Add height to all sizes
        if (sizes) {
            Object.entries(sizes).forEach(size => {
                const [key, value]: [string, { width?: number, height?: number }] = size
                sizes[key].height = setHeightFromRatio(value.width)
            })
        }
    }


    /**
     * Image attributes
     */
    $: imgWidth = sizes && sizes.small ? sizes.small.width : width
    $: imgHeight = sizes && sizes.small ? sizes.small.height : height
    $: imgSrc = id ? getAssetUrlKey(id, `${sizeKey}-small-jpg`) : src ? src : undefined
    $: srcSet = {
        // WebP
        webp:
            sizes ? [
                `${getAssetUrlKey(id, `${sizeKey}-small-webp`)} 345w`,
                sizes.medium ? `${getAssetUrlKey(id, `${sizeKey}-medium-webp`)} 768w` : null,
                sizes.large ? `${getAssetUrlKey(id, `${sizeKey}-large-webp`)} 1280w` : null,
            ]
            : [getAssetUrlKey(id, `${sizeKey}-webp`)],
        // JPG
        jpg:
            sizes ? [
                `${getAssetUrlKey(id, `${sizeKey}-small-jpg`)} 345w`,
                sizes.medium ? `${getAssetUrlKey(id, `${sizeKey}-medium-jpg`)} 768w` : null,
                sizes.large ? `${getAssetUrlKey(id, `${sizeKey}-large-jpg`)} 1280w` : null,
            ]
            : [getAssetUrlKey(id, `${sizeKey}-jpg`)]
    }
</script>

<picture class={$$props.class}>
    <source
        type="image/webp"
        srcset={srcSet.webp.join(', ').trim()}
    >
    <img
        src={imgSrc}
        sizes={sizes ? '(min-width: 1200px) 864px, (min-width: 992px) 708px, (min-width: 768px) 540px, 100%' : null}
        srcset={srcSet.jpg.join(', ').trim()}
        width={imgWidth}
        height={imgHeight}
        alt={alt}
        loading={lazy ? 'lazy' : undefined}
        decoding={lazy ? "async" : undefined}
    />
</picture>