/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const parser = require('@babel/parser');
const fs = require('fs');
const mkdirp = require('mkdirp');
const config = require('../config');

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
      // 'estree',
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
  const resultObj = FirstOBJ;
  for (const key in SecondOBJ) {
    resultObj[key] = FirstOBJ[key] && FirstOBJ[key].toString() === '[object Object]'
      ? deepObjectMerge(FirstOBJ[key], SecondOBJ[key]) : resultObj[key] = SecondOBJ[key];
  }
  return resultObj;
}

/**
 * 写文件
 * @param {String} path 路径
 * @param {String} contents 内容
 * @param {Function} cb 回调
 */
function writeFile(path, contents, cb) {
  const dirList = path.split('\\');
  dirList.pop();
  const dirPath = dirList.join('\\');
  mkdirp(dirPath).then(() => {
    fs.writeFile(path, contents, cb);
  }).catch((err) => {
    cb(err);
  });
}

/**
 * 将数据保存成d.ts文件
 * @param {String} name 文件名包含路径
 * @param {String} data 数据
 */
function saveTSDFile(name, data) {
  if (config.overwrite || !fs.existsSync(`${name}.d.ts`)) {
    writeFile(`${name}.d.ts`, data, (err) => {
      if (err) {
        throw err;
      }
      // eslint-disable-next-line no-console
      console.log('[info]', `File saved. (${name}.d.ts)`);
    });
  } else {
    console.warn(`[warn] [${name}.d.ts] is exists!`);
  }
}

/**
 * 解析执行命令的参数
 * @param {String[]} args 命令执行参数
 */
function parseArgv(args) {
  const argList = [].concat(args);
  const result = {};
  argList.shift();
  argList.shift();
  let setFlag = false;
  argList.forEach((arg, index) => {
    if (/^-/.test(arg)) {
      result[arg] = argList[index + 1];
      setFlag = true;
    } else if (setFlag) {
      setFlag = false;
    } else {
      result.target = arg;
    }
  });
  return result;
}

module.exports = {
  transformCode2Ast,
  getType,
  generateDescription,
  TYPES,
  deepObjectMerge,
  saveTSDFile,
  parseArgv,
};
