const types = require('@babel/types');
const funcComment2FuncInfo = require('../utils/funcComment2FuncInfo');

/**
 * 定义方法的参数处理
 * @param {Array} params 参数列表
 * @param {Array} paramsTypeList 参数类型列表
 */
function functionParamsDeel(params, paramsTypeList) {
  const newParams = [];
  params.forEach((param) => {
    paramsTypeList.forEach((paramType) => {
      if (param.name === paramType.name) {
        param.typeAnnotation = paramType.type;
      }
    });
    if (!param.typeAnnotation) {
      param.typeAnnotation = types.tsTypeAnnotation(types.tsAnyKeyword());
    }
    newParams.push(param);
  });

  return newParams;
}
/**
 * 方法定义遍历
 * @param {Object} path 遍历节点的路径
 */
function functionDeclaration(path) {
  let { node } = path;

  const paramsTypeList = funcComment2FuncInfo(node.leadingComments[0]).params;
  const newParams = functionParamsDeel(node.params, paramsTypeList);
  const returnType = types.tsTypeAnnotation(types.tsVoidKeyword());

  const tsDeclareFunction = types.tsDeclareFunction(node.id, null, newParams, returnType);
  tsDeclareFunction.leadingComments = node.leadingComments;
  node = tsDeclareFunction;
}

module.exports = { functionDeclaration };
