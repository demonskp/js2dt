const types = require('@babel/types');
const { NodePath } = require('@babel/traverse');
const funcComment2FuncInfo = require('../utils/funcComment2FuncInfo');
const { objectPattern } = require('../temp/objectTemp');

/**
 * 定义方法的参数处理
 * @param {Array} params 参数列表
 * @param {Array} paramsTypeList 参数类型列表
 */
function paramsAddTypeAnnotation(params, paramsTypeList) {
  params.forEach((oldParam) => {
    const param = oldParam;
    if (types.isIdentifier(param)) {
      let paramType = types.anyTypeAnnotation();
      paramsTypeList.forEach((docParamType) => {
        if (param.name === docParamType.name) {
          paramType = docParamType.type;
        }
      });
      param.typeAnnotation = types.typeAnnotation(paramType);
    }
    if (types.isObjectPattern(param)) {
      const properties = objectPattern(param.properties);
      const paramType = types.objectTypeAnnotation(properties, [], [], [], false);
      param.typeAnnotation = types.typeAnnotation(paramType);
    }
    if (types.isRestElement(param)) {
      let paramType = types.arrayTypeAnnotation(types.anyTypeAnnotation());
      paramsTypeList.forEach((docParamType) => {
        if (param.argument.name === docParamType.name) {
          if (types.isArrayTypeAnnotation(docParamType.type)
          || types.isGenericTypeAnnotation(docParamType.type)) {
            paramType = docParamType.type;
          } else {
            paramType = types.arrayTypeAnnotation(docParamType.type);
          }
        }
      });
      param.typeAnnotation = types.typeAnnotation(paramType);
    }
  });
  return params;
}

/**
 * 定义方法的参数处理
 * @param {Array} params 参数列表
 * @param {Array} paramsTypeList 参数类型列表
 */
function functionParamsDeel(params, paramsTypeList) {
  const newParams = [];
  let rest = null;
  params.forEach((param, index) => {
    if (types.isObjectPattern(param)) {
      const properties = objectPattern(param.properties);
      const typeParams = types.functionTypeParam(types.identifier(`param${index}`), types.objectTypeAnnotation(properties, [], [], [], false));
      newParams.push(typeParams);
      return;
    }
    if (types.isIdentifier(param)) {
      let paramType = types.anyTypeAnnotation();
      paramsTypeList.forEach((docParamType) => {
        if (param.name === docParamType.name) {
          paramType = docParamType.type;
        }
      });
      const typeParams = types.functionTypeParam(types.identifier(param.name), paramType);
      newParams.push(typeParams);
    }
    if (types.isRestElement(param)) {
      let paramType = types.arrayTypeAnnotation(types.anyTypeAnnotation());
      paramsTypeList.forEach((docParamType) => {
        if (param.argument.name === docParamType.name) {
          if (types.isArrayTypeAnnotation(docParamType.type)
          || types.isGenericTypeAnnotation(docParamType.type)) {
            paramType = docParamType.type;
          } else {
            paramType = types.arrayTypeAnnotation(docParamType.type);
          }
        }
      });
      rest = types.functionTypeParam(types.identifier(param.argument.name), paramType);
    }
  });
  return [newParams, rest];
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
      // TODO 修改为ts
      const properties = objectPattern(param.properties);
      const typeParams = types.functionTypeParam(types.identifier(`param${index}`), types.objectTypeAnnotation(properties, [], [], [], false));
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
 * 处理函数返回类型
 * @param {boolean} isAsync 是否异步
 * @param {Object} docReturnType 根据jsdoc生成的返回类型
 */
function returnTypeDeal(isAsync, docReturnType) {
  if (types.isGenericTypeAnnotation(docReturnType)) {
    const name = docReturnType.id.name.toLowerCase();
    if (/^promise/.test(name)) {
      return docReturnType;
    }
  }
  if (isAsync) {
    const typeParameter = types.typeParameterInstantiation([docReturnType]);
    const returnType = types.genericTypeAnnotation(types.identifier('Promise'), typeParameter);
    return returnType;
  }
  return docReturnType;
}

/**
 * 获取方法类型
 * @param {boolean} async 异步
 * @param {any[]} params 函数参数集合
 * @param {Object} leadingComment 前部注释
 */
function getFunctionTypeAnnotation(async, params, leadingComment) {
  const funcInfo = funcComment2FuncInfo(leadingComment);
  const [newParams, restParam] = functionParamsDeel(params, funcInfo.params);
  const returnType = returnTypeDeal(async, funcInfo.return);
  return types.functionTypeAnnotation(null, newParams, restParam, returnType);
}

/**
 * 获取ts方法类型
 * @param {boolean} async 异步
 * @param {any[]} params 函数参数集合
 * @param {Object} leadingComment 前部注释
 */
function getTsFunctionTypeAnnotation(async, params, leadingComment) {
  const funcInfo = funcComment2FuncInfo(leadingComment);
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
  const { leadingComments } = node;
  const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
  const functionType = types.typeAnnotation(
    getFunctionTypeAnnotation(node.async, node.params, leadingComment),
  );
  const id = types.identifier(node.id.name);
  id.typeAnnotation = functionType;
  const tsDeclareFunction = types.declareFunction(id);

  tsDeclareFunction.leadingComments = leadingComments;

  path.replaceWith(tsDeclareFunction);
}

module.exports = {
  functionDeclaration,
  getFunctionTypeAnnotation,
  paramsAddTypeAnnotation,
  returnTypeDeal,
  getTsFunctionTypeAnnotation,
};
