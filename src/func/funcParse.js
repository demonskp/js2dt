const funcComment2FuncInfo = require("./funcComment2FuncInfo");
const { generateDescription } = require("../utils");

/**
 * 方法模块转d.ts方法
 * @param {Object} funcNode 方法AST模块
 */
function funcParse(funcNode) {
  const funcTypeInfo = funcComment2FuncInfo(funcNode.leadingComments ? funcNode.leadingComments[0] : undefined);
  const funcName = funcNode.id ? funcNode.id.name : null;
  const params = funcNode.params;
  const paramsType = funcTypeInfo.params;
  const returnType = funcTypeInfo.return;


  return {
    leadingComments: funcNode.leadingComments,
    funcName,
    params,
    paramsType,
    returnType,
    generator: funcNode.generator,
    async: funcNode.generator,
  }
}

function funcString(funcParseNode) {
  if (!funcParseNode) return '';

  let paramsStr = [];
  for (let i = 0; i < params.length; i++) {
    let typeStr = ': any';
    if (paramsType[i]) {
      typeStr = ': ' + paramsType[i].type;
    }
    paramsStr.push(params[i].name + typeStr);
  }

  return `
${generateDescription(funcParseNode.leadingComments)}
declare ${funcParseNode.async?'async ':''}function ${funcParseNode.funcName}(${paramsStr.join(', ')}): ${funcParseNode.returnType}
  `
}

module.exports = {
  funcParse,
  funcString
};