import { sveltekit } from '@sveltejs/kit/vite'
import { scssImports } from './svelte.config.js'

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [
        sveltekit()
    ],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: scssImports,
            }
        }
    },
}

export default config