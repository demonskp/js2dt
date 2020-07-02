const funcComment2FuncInfo = require('../func/funcComment2FuncInfo');
const { getType, generateDescription, TYPES } = require('../utils');
const { objectStr } = require('../object/objectStr');

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

function variableCallStr(node, kind) {
  if (!node) return '';
  const { id } = node;

  switch (id.type) {
    case TYPES.Identifier:
      return `declare ${kind} ${node.id.name}: any;`;

    case TYPES.ObjectPattern:
      const { properties } = id;
      const objArr = [];
      properties.forEach((prop) => {
        objArr.push(`declare ${kind} ${prop.key.name}: any;`);
      });
      return objArr;

    default:
      break;
  }
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
