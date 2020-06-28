const program = require('commander');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const myPackage = require('../package.json');
const { transformCode2Ast, saveTSDFile } = require('../src/utils');
const { getDtsString } = require('../src');

const srcFiles = function (val) {
  return val.split(',');
};

program
  .version(myPackage.version, '-v, --version')
  .option('-s, --src <path>', '[MUST] target javascript file path', srcFiles)
  .parse(process.argv);

if (!program.src) {
  console.warn('--src option is MUST.');
  program.help();
}

function getDirNodeModules(callBack) {
  child_process.exec('npm root', { encoding: 'utf8', maxBuffer: 2048 }, (e, stdout, stderr) => {
    // if(e)throw e;
    callBack(stdout.toString().replace(/[\r\n]/g, ''), e);
  });
}

function exec(rootPath) {
  const readPath = path.resolve(rootPath, '../', program.src[0]);
  fs.readFile(readPath, (err, data) => {
    if (err) {
      console.error('[d2t]can not read this');
      throw err;
    }
    const ast = transformCode2Ast(data.toString());
    const code = getDtsString(ast);
    const outputSrc = readPath.slice(0, readPath.length - 3);
    console.log(readPath, outputSrc);
    saveTSDFile(outputSrc, code);
  });
}

getDirNodeModules((rootPath) => {
  console.log(`js2dt:${myPackage.version}`);
  exec(rootPath);
});
