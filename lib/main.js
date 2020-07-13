const path = require('path');
const fs = require('fs');
const { getDtsString } = require('.');
const { saveTSDFile, transformCode2Ast, parseArgv } = require('./utils');
const config = require('./config');

module.exports = function main() {
  return {
    visitor: {
      Program: {
        exit: (astPath, state) => {
          const info = parseArgv(process.argv);

          const { overwrite } = state.opts;
          const outDir = info['-d'] || info['--out-dir'] || 'dist';
          const targetDir = info.main || 'src';
          config.overwrite = overwrite;

          const { sourceFileName, root, filename } = state.file.opts;

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
