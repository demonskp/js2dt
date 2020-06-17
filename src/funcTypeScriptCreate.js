const funcComment2FuncInfo = require ("./funcComment2FuncInfo");

function generateDescription(leadingComments){
  if(!leadingComments) return '';
  const commentlines = leadingComments[0].value.split('\n');
  if(commentlines.length>1){
    return `/*${leadingComments[0].value}*/`
  }
  return `//${leadingComments[0].value}`
}

/**
 * 方法模块转d.ts方法
 * @param {Object} funcNode 方法AST模块
 */
function funcTypeScriptCreate(funcNode){
  const funcTypeInfo = funcComment2FuncInfo(funcNode.leadingComments?funcNode.leadingComments[0]:undefined);
  const funcName = funcNode.id.name;
  const params = funcNode.params;
  const paramsType = funcTypeInfo.params;
  const returnType = funcTypeInfo.return;

  let paramsStr = [];
  for(let i=0;i<params.length;i++){
    let typeStr = ': any';
    if(paramsType[i]){
      typeStr = ': '+paramsType[i].type;
    }
    paramsStr.push(params[i].name+typeStr);
  }

  return `
${generateDescription(funcNode.leadingComments)}
declare function ${funcName}(${paramsStr.join(', ')}): ${returnType}
  `
}

module.exports = funcTypeScriptCreate;