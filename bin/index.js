const program = require('commander');
const path = require('path');
const child_process = require('child_process');
const myPackage = require('../package.json');
const { js2dtFromFile } = require('../src');
const config = require('../src/config/config');

const srcFiles = function (val) {
  console.log(val);
  return val.split(' ');
};

program
  .version(myPackage.version, '-v, --version')
  .option('-s, --src <path>', '[MUST] target javascript file path', srcFiles)
  .option('--deep', 'Whether to include the file referenced by the request')
  .parse(process.argv);

if (!program.src) {
  console.warn('--src option is MUST.');
  program.help();
}

if (program.deep) {
  console.log('Deep mode start');
  config.deep = true;
}

function getDirNodeModules(callBack) {
  child_process.exec('npm root', { encoding: 'utf8', maxBuffer: 2048 }, (e, stdout, stderr) => {
    // if(e)throw e;
    callBack(stdout.toString().replace(/[\r\n]/g, ''), e);
  });
}
const allList = [];

function execut(srcList) {
  let deepList = [];
  srcList.forEach((src) => {
    if (allList.includes(src)) {
      return;
    }
    const dirList = src.split('\\');
    dirList.pop();
    config.rootPath = dirList.join('\\');
    js2dtFromFile(src);
    allList.push(src);
    deepList = Object.keys(config.scanMap);
    config.scanMap = {};
  });
  if (deepList.length) {
    execut(deepList);
  }
}

getDirNodeModules((rootPath) => {
  console.log(`js2dt:${myPackage.version}`);
  config.rootPath = path.resolve(rootPath, '../');
  const srcList = [];
  program.src.forEach((value) => {
    const src = path.resolve(config.rootPath, value);
    srcList.push(src);
  });
  execut(srcList);
});
