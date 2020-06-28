const { TYPES, getType } = require('../utils');
const funcComment2FuncInfo = require('../func/funcComment2FuncInfo');
const { deelFunctionParamsType, deelAsyncReturnType } = require('../func/funcStr');

function typeFunctionStr(node, leadingComments) {
  if (!node) return '';
  const {
    params = [],
  } = node;

  const { params: paramsType, return: returnType } = funcComment2FuncInfo(leadingComments ? leadingComments[0] : undefined);

  const paramsStr = deelFunctionParamsType(params, paramsType);

  const returnTypeReal = deelAsyncReturnType(node.async, returnType);

  return `(${paramsStr.join(', ')}) => ${returnTypeReal}`;
}

/**
 * 定义对象转换
 * @param {Object} node
 * @param {*} name
 * @param {*} kind
 */
function objectStr(node, name, kind) {
  if (!node) return '';
  const map = {};
  const { properties } = node;

  return `declare ${kind} ${name}: ${objectStrReal(node, name)}`;
}

function objectStrReal(node, name) {
  if (!node) return '';
  const map = {};
  const { properties } = node;

  properties.forEach((property) => {
    switch (property.value.type) {
      case TYPES.FunctionExpression:
        map[property.key.name] = typeFunctionStr(property.value, property.leadingComments);
        break;
      case TYPES.Literal:
        map[property.key.name] = getType(property.value.value);
        break;
      case TYPES.ObjectExpression:
        map[property.key.name] = objectStrReal(property.value, name);
        break;

      default:
        break;
    }
  });
  return `${JSON.stringify(map).replace(/"/g, '')}`;
}

module.exports = { objectStr };
