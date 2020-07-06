const fs = require('fs');
const { TYPES } = require('./utils');
const { transformCode2Ast, saveTSDFile } = require('./utils');
const { variableStr } = require('./variable/variableStr');
const { classStr } = require('./class/classStr');
const { functionDeclarationStr } = require('./func/funcStr');
const { namespaceStr } = require('./namespace/namespaceStr');
const { importStr } = require('./import/importStr');
const { exportStr } = require('./exportES6/export');

function getDtsString(ast) {
  const { body } = ast.program;
  const result = [];
  body.forEach((node) => {
    switch (node.type) {
      case TYPES.VariableDeclaration:
        result.push(variableStr(node));
        break;
      case TYPES.ClassDeclaration:
        result.push(classStr(node));
        break;
      case TYPES.FunctionDeclaration:
        result.push(functionDeclarationStr(node));
        break;
      case TYPES.ExpressionStatement:
        // TODO 暂时不处理
        break;
      case TYPES.ImportDeclaration:
        result.push(importStr(node));
        break;
      case TYPES.ExportDefaultDeclaration:
        result.push(exportStr(node, true));
        break;
      case TYPES.ExportNamedDeclaration:
        result.push(exportStr(node, false));
        break;
      default:
        break;
    }
  });
  // 命名空间单独处理
  result.push(namespaceStr(ast));
  return `${result.join('\n')}`;
}

/**
 * 读取js生成d.ts
 * @param {String} src 路径
 */
function js2dtFromFile(src) {
  const data = fs.readFileSync(src);
  const ast = transformCode2Ast(data.toString());
  const code = getDtsString(ast);
  const outputSrc = src.slice(0, src.length - 3);
  saveTSDFile(outputSrc, code);
}

module.exports = {
  getDtsString,
  js2dtFromFile,
};
