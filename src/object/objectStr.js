const { TYPES } = require('../utils');
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
 *
 * @param {Object} node
 * @param {*} name
 * @param {*} kind
 */
function objectStr(node, name, kind) {
  if (!node) return '';
  const map = {};
  const { properties } = node;

  properties.forEach((property) => {
    switch (property.value.type) {
      case TYPES.FunctionExpression:
        map[property.key.name] = typeFunctionStr(property.value, property.leadingComments);
        break;
      case TYPES.Literal:
        // TODO {yzy}
        // map[property.key.name] = typeFunctionStr(property.value, property.leadingComments);
        break;

      default:
        break;
    }
  });
  return `declare ${kind} ${name}: ${JSON.stringify(map).replace(/"/g, '')}`;
}

module.exports = { objectStr };
