import { easeInOutQuart } from './easing'


/**
 * Throttle function
 */
export const throttle = (func: Function, timeout: number) => {
    let ready: boolean = true
    return (...args: any) => {
        if (!ready) return
        ready = false
        func(...args)
        setTimeout(() => ready = true, timeout)
    }
}


/**
 * Debounce function
 */
export const debounce = (func: Function, timeout: number) => {
    let timer: NodeJS.Timeout
    return (...args: any) => {
        clearTimeout(timer)
        timer = setTimeout(() => func(...args), timeout)
    }
}


/**
 * Split text
 * @description Split a string into words or characters
 * @returns string[]
 */
 export const splitText = (text: string, mode: string = 'words'): string[] => {
    // Split by words
    if (mode === 'words') {
        const words = text
            .replace(/\\n/g, '\n')
            .replace(/\s+/g, m => m.includes('\n') ? '\n ' : ' ')
            .trim()
            .split(' ')

        return words
    }
    // Split by chars
    else if (mode === 'chars') {
        const chars = Array.from(text).map(char => char === ' ' ? '\xa0' : char)
        return chars
    }
}


/**
 * Capitalize first letter
 */
export const capitalizeFirstLetter = (string: string) => {
    return string[0].toUpperCase() + string.slice(1)
}


/**
 * Create a delay
 */
export function sleep (milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


/**
 * Linear Interpolation
 */
export const lerp = (start: number, end: number, amount: number): number => {
    return (1 - amount) * start + amount * end
}


/**
 * Re-maps a number from one range to another
 * @param value the incoming value to be converted
 * @param start1 lower bound of the value's current range
 * @param stop1 upper bound of the value's current range
 * @param start2 lower bound of the value's target range
 * @param stop2 upper bound of the value's target range
 * @param [withinBounds] constrain the value to the newly mapped range
 * @return remapped number
 */
export const map = (n: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds: boolean): number => {
    const value = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2
    if (!withinBounds) return value
    if (start2 < stop2) {
        return clamp(value, start2, stop2)
    } else {
        return clamp(value, stop2, start2)
    }
}


/**
 * Clamp a number
 */
export const clamp = (num: number, a: number, b: number) => {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b))
}


/**
 * Return a random element from an array
 */
export const getRandomItem = <T extends unknown> (array: T[]): T => {
    const randomItemIndex = ~~(array.length * Math.random())
    return array[randomItemIndex]
}


/**
 * Return random elements from an array
 */
export const getRandomItems = <T extends unknown> (array: any[], amount: number): T[] => {
    const shuffled = Array.from(array).sort(() => 0.5 - Math.random())
    return shuffled.slice(0, amount)
}


/**
 * Get a DOM element's position
 */
export const getPosition = (node: any, scope?: HTMLElement) => {
    const root = scope || document
    let offsetTop = node.offsetTop
    let offsetLeft = node.offsetLeft
    while (node && node.offsetParent && node.offsetParent != document && node !== root && root !== node.offsetParent) {
        offsetTop += node.offsetParent.offsetTop
        offsetLeft += node.offsetParent.offsetLeft
        node = node.offsetParent
    }
    return {
        top: offsetTop,
        left: offsetLeft
    }
}


/**
 * Scroll back to top after page transition
 */
export const scrollToTop = (delay?: number) => {
    const scroll = () => window.scrollTo(0,0)

    if (delay && delay > 0) {
        setTimeout(scroll, delay)
    } else {
        scroll()
    }
}


/**
 * Smooth Scroll to an element
 * @description Promised based
 * @url https://www.youtube.com/watch?v=oUSvlrDTLi4
 */
const smoothScrollPromise = (target: HTMLElement, duration: number = 1600): Promise<void> => {
    const position = target.getBoundingClientRect().top + 1
    const startPosition = window.scrollY
    const distance = position - startPosition
    let startTime: number = null

    // Return Promise
    return new Promise((resolve) => {
        if (!(target instanceof Element)) throw new TypeError('Argument 1 must be an Element')
        if (typeof window === 'undefined') return

        // Scroll to animation
        const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime
            const timeElapsed = currentTime - startTime
            // Create easing value
            const easedYPosition = easeInOutQuart(timeElapsed, startPosition, distance, duration)
            // Scroll to Y position
            window.scrollTo(0, easedYPosition)
            // Loop or end animation
            if (timeElapsed < duration) {
                requestAnimationFrame(animation)
            } else {
                return resolve()
            }
        }

        requestAnimationFrame(animation)
    })
}
export const smoothScroll = async (hash: string, changeHash: boolean = true, callback?: Function) => {
    const target = document.getElementById(hash)

    smoothScrollPromise(target).then(() => {
        if (changeHash) {
            location.hash = hash
        }
        callback && callback()
    })
}