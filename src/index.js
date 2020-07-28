const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const { functionDeclaration } = require('./traverse/functionDeclaration');
const { classDeclaration } = require('./traverse/classDeclaration');
const { variableDeclaration } = require('./traverse/variableDeclaration');
const { expressionStatement } = require('./traverse/expressionStatement');
const config = require('./config');
const { namespaceDeclaration } = require('./traverse/namespaceDeclaration');
const { transformCode2Ast, saveTSDFile } = require('./utils');

function getDtsString(ast) {
  traverse(ast, {
    ClassDeclaration: (path) => {
      classDeclaration(path);
    },
    FunctionDeclaration: (path) => {
      functionDeclaration(path);
    },
    VariableDeclaration: (path) => {
      variableDeclaration(path);
    },
    ExpressionStatement: (path) => {
      expressionStatement(path);
    },
    Program: {
      exit: (path) => {
        const namespaceList = namespaceDeclaration(config.nameSpaceMap);
        namespaceList.forEach((namespace) => {
          path.node.body.push(namespace);
        });
      },
    },
  });
  return generate(ast).code;
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
