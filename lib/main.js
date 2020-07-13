const path = require('path');
const { getDtsString } = require('.');
const { saveTSDFile } = require('./utils');

module.exports = function (babel) {
  return {
    visitor: {
      Program: {
        exit: (astPath, state) => {
          const outDir = state.opts.out ? state.opts.out : 'dist';
          const { sourceFileName, root } = state.file.opts;

          const sourceFileNameList = sourceFileName.split('.');
          sourceFileNameList.pop();
          const srcDTSName = sourceFileNameList.join('.');
          const outPath = path.resolve(root, outDir, 'any', srcDTSName);

          const dtsCode = getDtsString(astPath.parent);
          saveTSDFile(outPath, dtsCode);
        },
      },
    },
  };
};
