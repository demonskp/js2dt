const { generateDescription } = require('../utils');
const funcComment2FuncInfo = require('./funcComment2FuncInfo');

/**
 * 方法AST对象转DTS语句
 * @param {Object} funcNode 方法AST对象
 */
function functionDeclarationStr(funcNode) {
  if (!funcNode) return '';
  const {
    params,
  } = funcNode;

  const { params: paramsType, return: returnType } = funcComment2FuncInfo(funcNode.leadingComments ? funcNode.leadingComments[0] : undefined);

  const paramsStr = [];
  for (let i = 0; i < params.length; i += 1) {
    let typeStr = ': any';
    paramsType.forEach((obj) => {
      if (obj.name === params[i].name) {
        typeStr = `: ${obj.type}`;
      }
    });
    let { name } = params[i];
    // 匿名参数处理
    if (!name) {
      name = `props${i}`;
      typeStr = ': Object';
    }
    paramsStr.push(name + typeStr);
  }

  return `
${generateDescription(funcNode.leadingComments)}
declare ${funcNode.async ? 'async ' : ''}function ${funcNode.id.name}(${paramsStr.join(', ')}): ${returnType}
  `;
}

module.exports = { functionDeclarationStr };
