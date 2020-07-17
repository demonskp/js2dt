const path = require('path');
const fs = require('fs');
const { getDtsString } = require('.');
const { saveTSDFile, transformCode2Ast, parseArgv } = require('./utils');
const config = require('./config');

/**
 * 阅读模块信息
 * @param {String} root 模块根路径
 */
function readPackage(root) {
  const data = fs.readFileSync(path.resolve(root, './package.json'));
  const packageInfo = JSON.parse(data);
  return packageInfo;
}

/**
 * 初始化配置
 * @param {Boolean} overwrite 是否复写
 * @param {String} root 模块根路径
 */
function configInit(overwrite, root) {
  config.overwrite = overwrite;
  if (!config.packageInfo) {
    config.isModuleIn = true;
    config.packageInfo = readPackage(root);
  } else {
    config.isModuleIn = false;
  }
  config.moduleName = config.packageInfo.name;
}

module.exports = function main() {
  return {
    visitor: {
      Program: {
        exit: (astPath, state) => {
          const info = parseArgv(process.argv);
          const { overwrite, outdir, publicdir } = state.opts;
          const outDir = outdir || info['-d'] || info['--out-dir'] || '';
          const targetDir = publicdir || info.target || '';

          const { sourceFileName, root, filename } = state.file.opts;

          configInit(overwrite, root);

          const sourceFileNameList = sourceFileName.split('.');
          sourceFileNameList.pop();
          const srcDTSName = sourceFileNameList.join('.').replace(/\.\.\//g, '');
          const outPath = path.resolve(root, outDir, path.relative(targetDir, srcDTSName));
          const data = fs.readFileSync(filename);
          const ast = transformCode2Ast(data.toString());
          const dtsCode = getDtsString(ast);

          saveTSDFile(outPath, dtsCode);
        },
      },
    },
  };
};
