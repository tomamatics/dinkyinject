import typescript from 'rollup-plugin-typescript2';
const config = require('./tasks/config');

export default {
    input: config.entryPoint,
    output: [
        {
            format: 'cjs',
            file: config.outputs.cjs
        },
        {
            format: 'esm',
            file: config.outputs.esm
        }
    ],
    external: id => /(tslib|reflect-metadata)/.test(id),
    watch: {
        include: `${config.folders.src}/**/*`,
        clearScreen: false
    },
    plugins: [
        typescript()
    ],
    onwarn: warning => {
        console.error(warning);
    }
};
