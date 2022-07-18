const cssnano = require('cssnano')
const presetEnv = require('postcss-preset-env')
const focusVisible = require('postcss-focus-visible')
// const sortMediaQueries = require('postcss-sort-media-queries')
const normalize = require('postcss-normalize')


module.exports = {
    plugins: [
        // Preset Env
        presetEnv({
            stage: 2,
        }),

        // Focus visible
        focusVisible({}),

        // Sort media queries
        // sortMediaQueries({
        //     sort: 'mobile-first'
        // }),

        // Normalize
        normalize({}),

        // CSS Nano
        !process.env.DEV && cssnano({
            preset: ['default', {
                autoprefixer: true,
                discardComments: { removeAll: true },
                calc: { precision: 2 },
                safe: true
            }]
        }),
    ]
}