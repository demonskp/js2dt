const funcComment2FuncInfo = require ("./funcComment2FuncInfo");

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
/*${funcNode.leadingComments?funcNode.leadingComments[0].value:''}*/
declare function ${funcName}(${paramsStr.join(', ')}): ${returnType}
  `
}

module.exports = funcTypeScriptCreate;