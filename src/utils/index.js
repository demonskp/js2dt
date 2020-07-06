const parser = require('@babel/parser');
const fs = require('fs');
const config = require('../config/config');

/**
 * 代码转AST树
 * @param {String} code JS代码字符串
 */
function transformCode2Ast(code) {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
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

/**
 * 获取对象类型
 * @param {*} obj 对象
 */
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
  ImportDeclaration: 'ImportDeclaration',
  ExportDefaultDeclaration: 'ExportDefaultDeclaration',
  ExportNamedDeclaration: 'ExportNamedDeclaration',
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

/**
 * 将数据保存成d.ts文件
 * @param {String} name 文件名包含路径
 * @param {String} data 数据
 */
function saveTSDFile(name, data) {
  try {
    if (config.overwrite) {
      console.log('[info]', `File saved. (${name}.d.ts)`);
      fs.writeFileSync(`${name}.d.ts`, data);
    } else if (!fs.existsSync(`${name}.d.ts`)) {
      console.log(`File saved. (${name}.d.ts)`);
      fs.writeFileSync(`${name}.d.ts`, data);
    } else {
      const err = new Error(`[warn] [${name}.d.ts] is exists!`);
      err.code = 10001;
      throw err;
    }
  } catch (error) {
    if (error.code > 10000) {
      throw error;
    } else {
      const err = new Error(`[error] save file [${name}.d.ts] failure!`);
      err.code = 10002;
      throw err;
    }
  }
}

module.exports = {
  transformCode2Ast,
  getType,
  generateDescription,
  TYPES,
  deepObjectMerge,
  saveTSDFile,
};
