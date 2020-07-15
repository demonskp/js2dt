const types = require('@babel/types');
const { NodePath } = require('@babel/traverse');
const { funcComment2TsFuncInfo } = require('../utils/funcComment2TsFuncInfo');
const { tsObjectPattern } = require('../temp/objectTemp');

/**
 * 定义方法的参数处理
 * @param {Array} params 参数列表
 * @param {Array} paramsTypeList 参数类型列表
 */
function paramsAddTsTypeAnnotation(params, paramsTypeList) {
  params.forEach((oldParam, index) => {
    let param = oldParam;
    if (types.isIdentifier(param)) {
      let paramType = types.tsAnyKeyword();
      paramsTypeList.forEach((docParamType) => {
        if (param.name === docParamType.name) {
          paramType = docParamType.type;
        }
      });
      param.typeAnnotation = types.tsTypeAnnotation(paramType);
    }
    if (types.isObjectPattern(param)) {
      const members = tsObjectPattern(param.properties);
      const typeLiteral = types.tsTypeLiteral(members);
      const typeParams = types.identifier(`param${index}`);
      typeParams.typeAnnotation = types.tsTypeAnnotation(typeLiteral);
      param = typeParams;
    }
    if (types.isRestElement(param)) {
      let paramType = types.tsArrayType(types.tsAnyKeyword());
      paramsTypeList.forEach((docParamType) => {
        if (param.argument.name === docParamType.name) {
          if (types.isTSArrayType(docParamType.type)
          || types.isTSTypeReference(docParamType.type)) {
            paramType = docParamType.type;
          } else {
            paramType = types.tsArrayType(docParamType.type);
          }
        }
      });
      param.typeAnnotation = types.tsTypeAnnotation(paramType);
    }
  });
  return params;
}

/**
 * 定义ts方法的参数处理
 * @param {Array} params 参数列表
 * @param {Array} paramsTypeList 参数类型列表
 */
function tsFunctionParamsDeel(params, paramsTypeList) {
  const newParams = [];
  params.forEach((param, index) => {
    if (types.isObjectPattern(param)) {
      const members = tsObjectPattern(param.properties);
      const typeLiteral = types.tsTypeLiteral(members);
      const typeParams = types.identifier(`param${index}`);
      typeParams.typeAnnotation = types.tsTypeAnnotation(typeLiteral);
      newParams.push(typeParams);
      return;
    }
    if (types.isIdentifier(param)) {
      let paramType = types.tsAnyKeyword();
      paramsTypeList.forEach((docParamType) => {
        if (param.name === docParamType.name) {
          paramType = docParamType.type;
        }
      });
      const typeParams = types.identifier(param.name);
      typeParams.typeAnnotation = types.tsTypeAnnotation(paramType);
      newParams.push(typeParams);
    }
    if (types.isRestElement(param)) {
      let paramType = types.tsTypeAnnotation(types.tsArrayType(types.tsAnyKeyword()));
      paramsTypeList.forEach((docParamType) => {
        if (param.argument.name === docParamType.name) {
          if (types.isTSArrayType(docParamType.type)
          || types.isTSTypeReference(docParamType.type)) {
            paramType = types.tsTypeAnnotation(docParamType.type);
          } else {
            paramType = types.tsTypeAnnotation(types.tsArrayType(docParamType.type));
          }
        }
      });
      param.typeAnnotation = paramType;
      newParams.push(param);
    }
  });
  return newParams;
}

/**
 * 处理函数返回TS类型
 * @param {boolean} isAsync 是否异步
 * @param {Object} docReturnType 根据jsdoc生成的返回类型
 */
function returnTsTypeDeal(isAsync, docReturnType) {
  if (types.isTSTypeReference(docReturnType)) {
    const { name } = docReturnType.typeName;
    if (/^promise/.test(name)) {
      return types.tsTypeAnnotation(docReturnType);
    }
  }
  if (isAsync) {
    const typeParameter = types.tsTypeParameterInstantiation([docReturnType]);
    const returnType = types.tsTypeReference(types.identifier('Promise'), typeParameter);
    return types.tsTypeAnnotation(returnType);
  }
  return types.tsTypeAnnotation(docReturnType);
}

/**
 * 获取ts方法类型
 * @param {boolean} async 异步
 * @param {any[]} params 函数参数集合
 * @param {Object} leadingComment 前部注释
 */
function getTsFunctionTypeAnnotation(async, params, leadingComment) {
  const funcInfo = funcComment2TsFuncInfo(leadingComment);
  const newParams = tsFunctionParamsDeel(params, funcInfo.params);
  const returnType = types.tsTypeAnnotation(types.tsAnyKeyword());

  const functionType = types.tsFunctionType(null, newParams, returnType);

  return functionType;
}

/**
 * 方法定义遍历
 * @param {NodePath} path 遍历节点的路径
 */
function functionDeclaration(path) {
  const { node } = path;
  node.trailingComments = null;
  if (types.isFunctionDeclaration(node)) {
    const { leadingComments, params, async } = node;
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;

    const funcInfo = funcComment2TsFuncInfo(leadingComment);
    const newParams = tsFunctionParamsDeel(params, funcInfo.params);

    const id = types.identifier(node.id.name);

    const returnType = returnTsTypeDeal(async, funcInfo.return);

    const tsDeclareFunction = types.tsDeclareFunction(id, null, newParams, returnType);
    tsDeclareFunction.declare = true;
    tsDeclareFunction.leadingComments = leadingComments;

    path.replaceWith(tsDeclareFunction);
  }
}

module.exports = {
  functionDeclaration,
  paramsAddTsTypeAnnotation,
  returnTsTypeDeal,
  getTsFunctionTypeAnnotation,
};
