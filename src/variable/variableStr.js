const path = require('path');
const fs = require('fs');
const funcComment2FuncInfo = require('../func/funcComment2FuncInfo');
const { getType, generateDescription, TYPES } = require('../utils');
const { objectStr } = require('../object/objectStr');
const config = require('../config/config');

function variableFunctionExpressionStr(node, leadingComments) {
  if (!node) return '';
  const {
    params,
  } = node.init;

  const { params: paramsType, return: returnType } = funcComment2FuncInfo(leadingComments ? leadingComments[leadingComments.length - 1] : undefined);

  const paramsStr = [];
  for (let i = 0; i < params.length; i += 1) {
    let typeStr = ': any';
    paramsType.forEach((obj) => {
      if (obj.name === params[i].name) {
        typeStr = `: ${obj.type}`;
      }
    });
    paramsStr.push(params[i].name + typeStr);
  }

  return `${node.id.name} : (${paramsStr.join(', ')}) => ${returnType};`;
}

/**
 * 普通定义的数据解析
 * @param {Object} node AST对象
 */
function variableLiteralStr(node) {
  if (!node) return '';

  return `${node.id.name}: ${getType(node.init.value)};`;
}

function requiredPathSave(router) {
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

function variableCallStr(node, kind) {
  if (!node) return '';
  const { id } = node;

  const { deep } = config;
  if (deep && node.init.callee.name === 'require') {
    const router = node.init.arguments[0].value;
    requiredPathSave(router);
  }

  switch (id.type) {
    case TYPES.Identifier:
      if (node.init.callee.name === 'require') {
        return `import ${node.id.name} from '${node.init.arguments[0].value}'`;
      }
      return `declare ${kind} ${node.id.name}: any;`;

    case TYPES.ObjectPattern:
      const { properties } = id;
      const objArr = [];
      if (node.init.callee.name === 'require') {
        properties.forEach((prop) => {
          objArr.push(prop.key.name);
        });
        return `import {${objArr.join(',')}} from '${node.init.arguments[0].value}'`;
      }
      properties.forEach((prop) => {
        objArr.push(`declare ${kind} ${prop.key.name}: any;`);
      });
      return objArr;

    default:
      break;
  }
  return '';
}

/**
 * 定义AST解析DTS
 * @param {Object} variableNode 定义AST对象
 */
function variableStr(variableNode) {
  if (!variableNode) return '';

  const { kind, declarations, leadingComments } = variableNode;
  let declArr = [];

  declarations.forEach((node) => {
    if (!node.init) {
      declArr.push(`declare ${kind} ${node.id.name};`);
      return;
    }
    switch (node.init.type) {
      case TYPES.ArrowFunctionExpression:
        declArr.push(`declare ${kind} ${variableFunctionExpressionStr(node, leadingComments)}`);
        break;
      case TYPES.Literal:
        declArr.push(`declare ${kind} ${variableLiteralStr(node)}`);
        break;
      case TYPES.ObjectExpression:
        declArr.push(objectStr(node.init, node.id.name, variableNode.kind));
        break;
      case TYPES.CallExpression:
        declArr = declArr.concat(variableCallStr(node, kind));
        break;
      case TYPES.Identifier:
        declArr.push(`declare ${kind} ${node.id.name}: any;`);
        break;
      case TYPES.UnaryExpression:
        declArr.push(`declare ${kind} ${node.id.name}: Number;`);
        break;
      case TYPES.BinaryExpression:
        declArr.push(`declare ${kind} ${node.id.name}: any;`);
        break;
      default:
        break;
    }
  });

  return `
${generateDescription(variableNode.leadingComments)}
${declArr.join('\n')}`;
}

module.exports = { variableStr };
