const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { TYPES } = require('../utils');

/**
 * 导入路径保存下来
 * @param {String} router 导入的路径
 */
function importPathSave(router) {
  const { rootPath } = config;
  if (/^[\.\/|\.\.\/]/.test(router)) {
    let src = path.resolve(rootPath, router);
    if (fs.existsSync(`${src}.js`)) {
      src += '.js';
    } else if (fs.existsSync(path.resolve(src, './index.js'))) {
      src = path.resolve(src, './index.js');
    }
    config.scanMap[src] = [];
  }
}

/**
 * 导入语句转化
 * @param {Object} node 导入语句的AST
 */
function importStr(node) {
  if (!node) return '';
  const importDefaultArr = [];
  const importArr = [];
  const { specifiers, source } = node;
  if (config.deep) {
    importPathSave(source.value);
  }

  specifiers.forEach((specifier) => {
    if (specifier.type === TYPES.ImportDefaultSpecifier) {
      importDefaultArr.push(specifier.local.name);
    } else if (specifier.type === TYPES.ImportSpecifier) {
      importArr.push(specifier.local.name);
    }
  });
  importDefaultArr.push(`{${importArr.join(',')}}`);
  return `import ${importDefaultArr.join(',')} from '${source.value}';`;
}

module.exports = { importStr };
