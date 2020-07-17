const program = require('commander');
const path = require('path');
const child_process = require('child_process');
const myPackage = require('../package.json');
const { js2dtFromFile } = require('../src');
const config = require('../src/config');

const srcFiles = function (val) {
  return val.split(' ');
};

program
  .version(myPackage.version, '-v, --version')
  .option('-s, --src <path>', '[MUST] target javascript file path', srcFiles)
  .option('--deep', 'Whether to include the file referenced by the request')
  .option('-o, --overwrite', 'Overwrite existing files')
  .parse(process.argv);

if (!program.src) {
  console.warn('[warn]', '--src option is MUST.');
  program.help();
}

if (program.deep) {
  console.log('[info]', 'Deep mode start');
  config.deep = true;
}

if (program.overwrite) {
  console.log('[info]', 'overwrite mode start');
  config.overwrite = true;
}

function getDirNodeModules(callBack) {
  child_process.exec('npm root', { encoding: 'utf8', maxBuffer: 2048 }, (e, stdout, stderr) => {
    // if(e)throw e;
    callBack(stdout.toString().replace(/[\r\n]/g, ''), e);
  });
}
const allList = [];
const errList = [];

function execut(srcList) {
  let deepList = [];
  srcList.forEach((src) => {
    if (allList.includes(src)) {
      return;
    }
    const dirList = src.split('\\');
    dirList.pop();
    config.rootPath = dirList.join('\\');
    try {
      js2dtFromFile(src);
    } catch (error) {
      errList.push(src);
      if (error.code > 10000) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }

    allList.push(src);
    deepList = deepList.concat(Object.keys(config.scanMap));
    config.scanMap = {};
  });
  if (deepList.length) {
    execut(deepList);
  }
}

getDirNodeModules((rootPath) => {
  console.log('[info]', `js2dt:${myPackage.version}`);
  config.rootPath = path.resolve(rootPath, '../');
  const srcList = [];
  program.src.forEach((value) => {
    const src = path.resolve(config.rootPath, value);
    srcList.push(src);
  });
  execut(srcList);
});
