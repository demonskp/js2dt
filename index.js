const { resolve } = require('path');
const { js2dtFromFile } = require('./lib');
const config = require('./lib/config');

const path = resolve(__dirname, './testd.js');
config.overwrite = true;
js2dtFromFile(path);
