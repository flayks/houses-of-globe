import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-auto'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const stylePath = `${dirname(fileURLToPath(import.meta.url))}/src/style`
export const scssImports = `@use "${stylePath}/imports.scss" as *;`

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Preprocessors docs: https://github.com/sveltejs/svelte-preprocess
    preprocess: preprocess({
        scss: {
            prependData: scssImports,
            renderSync: true,
		}
    }),

    kit: {
        adapter: adapter(),
        alias: {
            $components: 'src/components',
            $animations: 'src/animations',
            $modules: 'src/modules',
            $utils: 'src/utils',
            $style: 'src/style',
        },
    }
}

export default config