const { generateDescription, TYPES } = require('../utils');
const funcComment2FuncInfo = require('./funcComment2FuncInfo');

function anonymousParamStr(paramNode) {
  const obj = {};

  const { properties } = paramNode;

  properties.forEach((prop) => {
    obj[prop.key.name] = 'any';
  });

  return JSON.stringify(obj).replace(/"/g, '');
}

/**
 * 方法AST对象转DTS语句
 * @param {Object} funcNode 方法AST对象
 */
function functionDeclarationStr(funcNode) {
  if (!funcNode) return '';
  const {
    params = [],
  } = funcNode;

  const { params: paramsType, return: returnType } = funcComment2FuncInfo(funcNode.leadingComments ? funcNode.leadingComments[0] : undefined);

  const paramsStr = [];
  params.forEach((param, index) => {
    let typeStr = ': any';
    let name = '';
    switch (param.type) {
      case TYPES.ObjectPattern:
        name = `props${index}`;
        typeStr = `: ${anonymousParamStr(param)}`;
        paramsStr.push(name + typeStr);
        break;
      case TYPES.Identifier:
        name = param.name;
        paramsType.forEach((obj) => {
          if (obj.name === param.name) {
            typeStr = `: ${obj.type}`;
          }
        });
        paramsStr.push(name + typeStr);
        break;
      default:
        break;
    }
  });

  return `
${generateDescription(funcNode.leadingComments)}
declare ${funcNode.async ? 'async ' : ''}function ${funcNode.id.name}(${paramsStr.join(', ')}): ${returnType}
  `;
}

module.exports = { functionDeclarationStr };
