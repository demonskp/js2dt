const parser = require('@babel/parser');
const fs = require('fs');

/**
 * 代码转AST树
 * @param {String} code JS代码字符串
 */
function transformCode2Ast(code) {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'asyncGenerators',
      'bigInt',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'doExpressions',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'functionSent',
      'importMeta',
      'logicalAssignment',
      'nullishCoalescingOperator',
      'numericSeparator',
      'objectRestSpread',
      'optionalCatchBinding',
      'optionalChaining',
      ['pipelineOperator', {
        proposal: 'minimal',
      }],
      'throwExpressions',
      'topLevelAwait',
      'estree',
    ],
  });
}

function getType(obj) {
  if (Array.isArray(obj)) {
    return 'Array';
  }
  if (obj === null) {
    return 'any';
  }

  return typeof obj;
}

function generateDescription(leadingComments) {
  if (!leadingComments) return '';
  const commentlines = leadingComments[leadingComments.length - 1].value.split('\n');
  if (commentlines.length > 1) {
    return `/*${leadingComments[leadingComments.length - 1].value}*/`;
  }
  return `//${leadingComments[leadingComments.length - 1].value}`;
}

const TYPES = {
  MethodDefinition: 'MethodDefinition',
  ClassProperty: 'ClassProperty',
  Identifier: 'Identifier',
  Literal: 'Literal',
  ArrowFunctionExpression: 'ArrowFunctionExpression',
  VariableDeclaration: 'VariableDeclaration',
  FunctionDeclaration: 'FunctionDeclaration',
  ExpressionStatement: 'ExpressionStatement',
  ClassDeclaration: 'ClassDeclaration',
  ObjectPattern: 'ObjectPattern',
  ObjectExpression: 'ObjectExpression',
  FunctionExpression: 'FunctionExpression',
  CallExpression: 'CallExpression',
  UnaryExpression: 'UnaryExpression',
  BinaryExpression: 'BinaryExpression',
};

/**
 * 深度合并两个对象
 * @param {Object} FirstOBJ 目标对象
 * @param {Object} SecondOBJ 被合并对象
 */
function deepObjectMerge(FirstOBJ, SecondOBJ) { // 深度合并对象
  for (const key in SecondOBJ) {
    FirstOBJ[key] = FirstOBJ[key] && FirstOBJ[key].toString() === '[object Object]'
      ? deepObjectMerge(FirstOBJ[key], SecondOBJ[key]) : FirstOBJ[key] = SecondOBJ[key];
  }
  return FirstOBJ;
}

function saveTSDFile(name, src) {
  fs.writeFile(`${name}.d.ts`, src, { encoding: 'UTF-8' }, (err) => {
    if (err) throw Error(`${err.name} ${err.code} ${err.message} ${err.path}`);
    console.log(`File saved. (${name}.d.ts)`);
  });
}

module.exports = {
  transformCode2Ast,
  getType,
  generateDescription,
  TYPES,
  deepObjectMerge,
  saveTSDFile,
};
