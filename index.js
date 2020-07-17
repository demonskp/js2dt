const { resolve } = require('path');
const { js2dtFromFile } = require('./src');
const config = require('./src/config');

const path = resolve(__dirname, './testd.js');
config.overwrite = true;
js2dtFromFile(path);
