import { crossfade } from 'svelte/transition'
import { quartOut } from 'svelte/easing'

// Crossfade transition
export const [send, receive] = crossfade({
    // duration: 1200,
    duration: d => Math.sqrt(d * 200),
    fallback (node, params) {
        const {
            duration = 600,
            easing = quartOut,
            start = 0.85
        } = params
        const style = getComputedStyle(node)
        const transform = style.transform === 'none' ? '' : style.transform
        const sd = 1 - start
        return {
            duration,
            easing,
            css: (t, u) => `
                transform: ${transform} scale(${1 - (sd * u)});
                opacity: ${t}
            `
        }
    }
})