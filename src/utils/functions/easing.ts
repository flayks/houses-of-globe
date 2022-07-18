/**
 * Ease: In Out Quart
 */
export const easeInOutQuart = (t: number, b: number, c: number, d: number) => {
	t /= d/2
	if (t < 1) return c/2 * t * t * t * t + b
	t -= 2
	return -c / 2 * (t * t * t * t - 2) + b
}