const funcComment2FuncInfo = require('../func/funcComment2FuncInfo');
const { getType, generateDescription, TYPES } = require('../utils');

function variableFunctionExpressionStr(node, leadingComments) {
  if (!node) return '';
  const {
    params,
  } = node.init;

  const { params: paramsType, return: returnType } = funcComment2FuncInfo(leadingComments ? leadingComments[0] : undefined);

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

  return `${node.id.name} = ${node.init.async ? 'async ' : ''} (${paramsStr.join(', ')}) => ${returnType};`;
}

/**
 * 普通定义的数据解析
 * @param {Object} node AST对象
 */
function variableLiteralStr(node) {
  if (!node) return '';

  return `${node.id.name}: ${getType(node.init.value)};`;
}

/**
 * 定义AST解析DTS
 * @param {Object} variableNode 定义AST对象
 */
function variableStr(variableNode) {
  if (!variableNode) return '';

  const { kind, declarations, leadingComments } = variableNode;
  const declArr = [];

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
      default:
        break;
    }
  });

  return `
${generateDescription(variableNode.leadingComments)}
${declArr.join('\n')}
  `;
}

module.exports = { variableStr };