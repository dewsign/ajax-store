import RollupPluginBabel from 'rollup-plugin-babel'

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
    },
    external: [
        'vue',
        'vuex',
        'axios',
        'lodash',
        'laravel-echo',
        'pusher-js',
    ],
    plugins: [
        RollupPluginBabel(),
    ],
}
