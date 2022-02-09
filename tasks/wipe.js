const empty = require('empty-folder');
const config = require('./config');

empty(config.folders.dist, false, () => { });
