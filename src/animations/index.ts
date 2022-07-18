import anime, { type AnimeParams } from 'animejs'
import type { TransitionConfig } from 'svelte/transition'


// Options interface
interface TransitionOptions {
    direct?: boolean
    children?: string
    targets?: Element
    from?: number | string
    to?: number | string
    opacity?: boolean
    rotate?: any
    rotateX?: number
    rotateRandom?: boolean
    duration?: number
    stagger?: number
    scale?: number[]
    delay?: number
    easing?: string
    clear?: boolean
}


/**
 * Effect: Fly
 * @returns Anime.js animation
 */
export const fly = (
    node: Element,
    {
        direct = false,
        targets = node,
        children,
        from = 16,
        to = 0,
        opacity = true,
        rotate = false,
        rotateX = 0,
        rotateRandom = false,
        duration = 1600,
        stagger,
        scale = null,
        delay = 0,
        easing = 'easeOutQuart',
        clear = false
    }: TransitionOptions
): TransitionConfig => {
    const anim = anime({
        autoplay: !direct,
        targets: children ? node.querySelectorAll(children) : targets,
        ...(opacity && { opacity: [0, 1] }),
        ...(scale && { scale }),
        ...(rotate && {
            rotate:
                // If Array, use it, otherwise use the value up to 0
                Array.isArray(rotate)
                    ? rotate
                    : [rotateRandom ? anime.random(-rotate, rotate) : rotate, 0]
        }),
        ...(rotateX && { rotateX: [rotateX, 0] }),
        translateY: [from, to],
        translateZ: 0,
        duration,
        easing,
        delay: stagger ? anime.stagger(stagger, { start: delay }) : delay,
        complete: ({ animatables }) => {
            // Remove styles on end
            if (clear) {
                animatables.forEach((el: AnimeParams) => {
                    el.target.style.transform = ''
                    opacity && (el.target.style.opacity = '')
                })
            }
        }
    })

    return direct ? anim : {
        tick: (t: number, u: number) => anim
    }
}


/**
 * Effect: Fade
 * @returns Anime.js animation
 */
export const fade = (
    node: Element,
    {
        direct = false,
        targets = node,
        children,
        from = 0,
        to = 1,
        duration = 1600,
        stagger,
        delay = 0,
        easing = 'easeInOutQuart',
        clear = false
    }: TransitionOptions
): TransitionConfig => {

    const anim = anime({
        autoplay: !direct,
        targets: children ? node.querySelectorAll(children) : targets,
        opacity: [from, to],
        duration,
        easing,
        delay: stagger ? anime.stagger(stagger, { start: delay }) : delay,
        complete: ({ animatables }) => {
            // Remove styles on end
            if (clear) {
                animatables.forEach((el: AnimeParams) => {
                    el.target.style.opacity = ''
                })
            }
        }
    })

    return direct ? anim : {
        tick: (t: number, u: number) => anim
    }
}


/**
 * Effect: Scale
 * @returns Anime.js animation
 */
export const scale = (
    node: Element,
    {
        direct = false,
        from = 0,
        to = 1,
        duration = 1200,
        delay = 0,
        easing = 'easeOutQuart',
        clear = false
    }: TransitionOptions
): TransitionConfig => {
    const anim = anime({
        autoplay: !direct,
        targets: node,
        scaleY: [from, to],
        translateZ: 0,
        duration,
        easing,
        delay,
        complete: ({ animatables }) => {
            // Remove styles on end
            if (clear) {
                animatables.forEach((el: AnimeParams) => {
                    el.target.style.transform = ''
                })
            }
        }
    })

    return direct ? anim : {
        tick: (t: number, u: number) => anim
    }
}


/**
 * Effect: Words reveal
 * @description Anime.js animation
 */
export const words = (
    node: Element,
    {
        direct = false,
        children = 'span',
        from = '45%',
        to = 0,
        duration = 1200,
        stagger = 60,
        rotate = 0,
        delay = 0,
        opacity = true,
        easing = 'easeOutQuart',
        clear = false
    }: TransitionOptions
): TransitionConfig => {
    const anim = anime({
        autoplay: !direct,
        targets: node.querySelectorAll(children),
        ...(opacity && { opacity: [0, 1] }),
        translateY: [from, to],
        ...(rotate && { rotateX: [rotate, 0] }),
        translateZ: 0,
        duration,
        easing,
        delay: stagger ? anime.stagger(stagger, { start: delay }) : delay,
        complete: ({ animatables }) => {
            // Remove styles on end
            if (clear) {
                animatables.forEach((el: AnimeParams) => {
                    el.target.style.transform = ''
                    opacity && (el.target.style.opacity = '')
                })
            }
        }
    })

    return direct ? anim : {
        tick: (t: number, u: number) => anim
    }
}



/**
 * Run animation on reveal
 * @description IntersectionObserver triggering an animation function or a callback
 */
export const reveal = (
    node: Element | any,
    {
        enable = true,
        targets = node,
        animation,
        options = {},
        callback,
        callbackTrigger,
        once = true,
        threshold = 0.2,
        rootMargin = '0px 0px 0px',
        queue = null,
        queueDelay = 0,
    }: revealOptions
) => {
    let observer: IntersectionObserver

    // Kill if IntersectionObserver is not supported
    if (typeof IntersectionObserver === 'undefined' || !enable) return

    // Use animation with provided node selector
    if (animation) {
        const anim = animation(node, {
            ...options,
            direct: true,
            autoplay: false
        })

        // If a queue exists, let it run animations
        if (queue) {
            queue.add(node, anim.play, queueDelay)

            return {
                destroy () {
                    queue.remove(node)
                }
            }
        }

        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anim && anim.play()
                    once && observer.unobserve(entry.target)
                }
            })
        }, { threshold, rootMargin })

        observer.observe(node)
    }

    // Custom callback
    else if (callback) {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const cb = callback(entry)

                if (entry.isIntersecting) {
                    // Run callback
                    callbackTrigger && callbackTrigger(cb)

                    // Run IntersectionObserver only once
                    once && observer.unobserve(entry.target)
                }
            })
        }, { threshold })

        const elements = typeof targets === 'string' ? node.querySelectorAll(targets) : targets

        if (elements) {
            // Observe each element
            if (elements.length > 0) {
                elements.forEach((target: Element) => {
                    observer.observe(target)
                })
            }
            // Directly observe
            else {
                observer.observe(elements)
            }
        }
    }

    // Methods
    return {
        // Destroy
        destroy () {
            observer && observer.disconnect()
        }
    }
}

interface revealOptions {
    animation?: Function
    options?: TransitionOptions
    queue?: any
    callback?: Function
    callbackTrigger?: any
    targets?: string | Element
    enable?: boolean
    once?: boolean
    threshold?: number,
    rootMargin?: string,
    queueDelay?: number
}

export { RevealQueue } from './RevealQueue'
