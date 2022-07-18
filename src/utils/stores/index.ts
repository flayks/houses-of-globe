import { writable } from 'svelte/store'

export const pageLoading = writable(false)
export const previousPage = writable('')