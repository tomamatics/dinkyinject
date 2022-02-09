const path = require('path');
const pkg = require('../package.json');

let config = {
    folders: {
        src: 'src',
        dist: 'dist'
    }
}

config.outputs = {
    cjs: path.join(config.folders.dist, pkg.distribution.main),
    esm: path.join(config.folders.dist, pkg.distribution.module),
}

config.entryPoint = path.join(config.folders.src, 'index.ts');

module.exports = config;
