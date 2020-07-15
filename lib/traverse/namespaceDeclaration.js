const types = require('@babel/types');
const {
  getFunctionTypeAnnotation, paramsAddTypeAnnotation, paramsAddTsTypeAnnotation, returnTypeDeal, returnTsTypeDeal,
} = require('./functionDeclaration');
const { objectPattern } = require('../temp/objectTemp');
const { funcComment2FuncInfo, funcComment2TsFuncInfo } = require('../utils/funcComment2FuncInfo');

/**
 * 命名空间模块处理
 * @param {Object} namespace 命名空间对象
 * @param {String} name 命名空间名字
 */
function moduleDeal(namespace, name) {
  const bodyList = [];
  Object.keys(namespace).forEach((nodeKey) => {
    const node = namespace[nodeKey];
    // eslint-disable-next-line no-underscore-dangle
    if (!node.__js2dt__not_namespace) {
      bodyList.push(moduleDeal(node, nodeKey));
      return;
    }
    if (types.isObjectExpression(node)) {
      const id = types.identifier(nodeKey);
      const properties = objectPattern(node.properties);
      id.typeAnnotation = types.typeAnnotation(types.objectTypeAnnotation(properties));
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isFunctionExpression(node)) {
      const { leadingComments } = node;
      const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
      const functionType = types.typeAnnotation(
        getFunctionTypeAnnotation(node.async, node.params, leadingComment),
      );
      const id = types.identifier(node.id.name);
      id.typeAnnotation = functionType;
      const tsDeclareFunction = types.declareFunction(id);
      tsDeclareFunction.leadingComments = node.leadingComments;
      bodyList.push(tsDeclareFunction);
      return;
    }
    if (types.isArrowFunctionExpression(node)) {
      const id = types.identifier(nodeKey);
      const { leadingComments, async, params } = node;
      const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
      id.typeAnnotation = types.typeAnnotation(
        getFunctionTypeAnnotation(async, params, leadingComment),
      );
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isNumericLiteral(node)) {
      const id = types.identifier(nodeKey);
      id.typeAnnotation = types.typeAnnotation(types.numberTypeAnnotation());
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isStringLiteral(node)) {
      const id = types.identifier(nodeKey);
      id.typeAnnotation = types.typeAnnotation(types.stringTypeAnnotation());
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isBooleanLiteral(node)) {
      const id = types.identifier(nodeKey);
      id.typeAnnotation = types.typeAnnotation(types.booleanTypeAnnotation());
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    const id = types.identifier(nodeKey);
    id.typeAnnotation = types.typeAnnotation(types.anyTypeAnnotation());
    const declarartor = types.variableDeclarator(id);
    const varibleDeclar = types.variableDeclaration('const', [declarartor]);
    varibleDeclar.declare = true;
    bodyList.push(varibleDeclar);
  });
  const body = types.tsModuleBlock(bodyList);
  const moduleNode = types.tsModuleDeclaration(types.identifier(name), body);
  return moduleNode;
}

/**
 * 导出语句处理
 * @param {Object} namespace 命名空间对象
 * @param {String} name 处理的名字
 */
function exportDefaultDeal(namespace, name) {
  if (!namespace || !name) return null;
  const node = namespace[name];
  let declaration = node;
  const { leadingComments, async } = node;
  if (types.isFunctionExpression(node) || types.isArrowFunctionExpression(node)) {
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
    const funcInfo = funcComment2TsFuncInfo(leadingComment);

    const newParams = paramsAddTsTypeAnnotation(node.params, funcInfo.params);
    const id = types.identifier(node.id ? node.id.name : '');
    const returnType = returnTsTypeDeal(async, funcInfo.return);
    const tsDeclareFunction = types.tsDeclareFunction(id, null, newParams, returnType);

    declaration = tsDeclareFunction;
  }
  const exportDefault = types.exportDefaultDeclaration(declaration);
  exportDefault.leadingComments = leadingComments;
  return exportDefault;
}

/**
 * 导出语句处理
 * @param {Object} namespace 命名空间对象
 * @param {String} name 处理的名字
 */
function exportsDeal(namespace, name) {
  if (!namespace || !name) return null;
  const node = namespace[name];
  let declaration = node;
  const { leadingComments, async } = node;
  if (types.isFunctionExpression(node) || types.isArrowFunctionExpression(node)) {
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
    const funcInfo = funcComment2TsFuncInfo(leadingComment);

    const newParams = paramsAddTsTypeAnnotation(node.params, funcInfo.params);
    const id = types.identifier(name);
    const returnType = returnTsTypeDeal(async, funcInfo.return);
    const tsDeclareFunction = types.tsDeclareFunction(id, null, newParams, returnType);

    declaration = tsDeclareFunction;
  }
  const exportNamed = types.exportNamedDeclaration(declaration);
  exportNamed.leadingComments = leadingComments;
  return exportNamed;
}

/**
 * 命名空间
 * @param {Object} namespaceMap 扫描到的命名空间集合
 */
function namespaceDeclaration(namespaceMap) {
  const resultList = [];
  Object.keys(namespaceMap).forEach((namespaceKey) => {
    if (namespaceKey === 'module') {
      resultList.push(exportDefaultDeal(namespaceMap[namespaceKey], 'exports'));
      return;
    }
    if (namespaceKey === 'exports') {
      Object.keys(namespaceMap[namespaceKey]).forEach((name) => {
        resultList.push(exportsDeal(namespaceMap[namespaceKey], name));
      });
      return;
    }
    const moduleNode = moduleDeal(namespaceMap[namespaceKey], namespaceKey);
    moduleNode.declare = true;
    resultList.push(moduleNode);
  });
  return resultList;
}

module.exports = { namespaceDeclaration };
