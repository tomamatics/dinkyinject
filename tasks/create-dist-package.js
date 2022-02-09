const fs = require('fs');
const config = require('./config');

const pkg = JSON.parse(fs.readFileSync('package.json').toString());
const internals = [];

if (pkg.distribution) {
    for (let key of Object.keys(pkg.distribution)) {
        if (internals.indexOf(key) === -1) {
            const value = pkg.distribution[key];

            if (value === null) {
                delete pkg[key];
            }
            else {
                pkg[key] = value;
            }
        }
    }

    delete pkg.distribution;
}

if (!fs.existsSync(config.folders.dist)) {
    fs.mkdirSync(config.folders.dist);
}

fs.writeFileSync(`${config.folders.dist}/package.json`, JSON.stringify(pkg, null, 2));
fs.copyFileSync('README.md', `${config.folders.dist}/README.md`);
fs.copyFileSync('LICENSE', `${config.folders.dist}/LICENSE`);