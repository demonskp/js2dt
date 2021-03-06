const types = require('@babel/types');
const {
  paramsAddTsTypeAnnotation, returnTsTypeDeal, getTsFunctionTypeAnnotation,
} = require('./functionDeclaration');
const { tsObjectPattern } = require('../temp/objectTemp');
const { funcComment2TsFuncInfo } = require('../utils/funcComment2TsFuncInfo');
const { classProperties } = require('./classDeclaration');
const config = require('../config');

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
      const members = tsObjectPattern(node.properties);
      const typeLiteral = types.tsTypeLiteral(members);
      id.typeAnnotation = types.tsTypeAnnotation(typeLiteral);
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isFunctionExpression(node)) {
      const { leadingComments, async } = node;
      const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
      const funcInfo = funcComment2TsFuncInfo(leadingComment);
      const id = types.identifier(nodeKey);
      const newParams = paramsAddTsTypeAnnotation(node.params, funcInfo.params);
      const returnType = returnTsTypeDeal(async, funcInfo.return);
      const tsDeclareFunction = types.tsDeclareFunction(id, null, newParams, returnType);
      tsDeclareFunction.declare = true;
      bodyList.push(tsDeclareFunction);
      return;
    }
    if (types.isArrowFunctionExpression(node)) {
      const id = types.identifier(nodeKey);
      const { leadingComments, async, params } = node;
      const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
      id.typeAnnotation = types.tsTypeAnnotation(
        getTsFunctionTypeAnnotation(async, params, leadingComment),
      );
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isNumericLiteral(node)) {
      const id = types.identifier(nodeKey);
      id.typeAnnotation = types.tsTypeAnnotation(types.tsNumberKeyword());
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isStringLiteral(node)) {
      const id = types.identifier(nodeKey);
      id.typeAnnotation = types.tsTypeAnnotation(types.tsStringKeyword());
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    if (types.isBooleanLiteral(node)) {
      const id = types.identifier(nodeKey);
      id.typeAnnotation = types.tsTypeAnnotation(types.tsBooleanKeyword());
      const declarartor = types.variableDeclarator(id);
      const varibleDeclar = types.variableDeclaration('const', [declarartor]);
      varibleDeclar.declare = true;
      bodyList.push(varibleDeclar);
      return;
    }
    const id = types.identifier(nodeKey);
    id.typeAnnotation = types.tsTypeAnnotation(types.tsAnyKeyword());
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
 * 作为模块导出
 * @param {Object} node 单一的节点
 * @param {String} name 模块名
 */
function moduleExports(node, name) {
  const exportList = [];
  const { leadingComments, async } = node;
  if (types.isIdentifier(node)) {
    const exportAssignment = types.tsExportAssignment(node);
    exportList.push(exportAssignment);
  }
  if (types.isFunctionExpression(node) || types.isArrowFunctionExpression(node)) {
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
    const funcInfo = funcComment2TsFuncInfo(leadingComment);

    const newParams = paramsAddTsTypeAnnotation(node.params, funcInfo.params);
    const id = types.identifier(node.id ? node.id.name : 'unnamedfunction');
    const returnType = returnTsTypeDeal(async, funcInfo.return);
    const tsDeclareFunction = types.tsDeclareFunction(id, null, newParams, returnType);
    exportList.push(tsDeclareFunction);
    const exportAssignment = types.tsExportAssignment(id);
    exportList.push(exportAssignment);
  }

  if (types.isObjectExpression(node)) {
    const exportAssignment = types.tsExportAssignment(node);
    exportList.push(exportAssignment);
  }

  const body = types.tsModuleBlock(exportList);
  const moduleID = types.stringLiteral(name);
  const modeleDeclar = types.tsModuleDeclaration(moduleID, body);
  modeleDeclar.declare = true;
  return modeleDeclar;
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
  if (config.isModuleIn) {
    const moduleNode = moduleExports(node, config.moduleName);
    if (moduleNode) return moduleNode;
  }
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
  if (types.isIdentifier(node)) {
    const newID = types.identifier(name);
    const typeRef = types.tsTypeReference(node);
    newID.typeAnnotation = types.tsTypeAnnotation(typeRef);
    const varDeclarator = types.variableDeclarator(newID, null);
    const variableDecl = types.variableDeclaration('const', [varDeclarator]);
    declaration = variableDecl;
  }
  if (types.isClassExpression(node)) {
    const newID = types.identifier(node.id.name);
    const { superClass } = node;
    const classBody = classProperties(node.body.body);
    const body = types.classBody(classBody);
    const classDeclar = types.classDeclaration(newID, superClass, body);
    declaration = classDeclar;
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
