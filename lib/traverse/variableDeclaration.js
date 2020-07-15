const types = require('@babel/types');
// eslint-disable-next-line no-unused-vars
const { NodePath } = require('@babel/traverse');
const path = require('path');
const fs = require('fs');
const { tsObjectPattern } = require('../temp/objectTemp');
const { getFunctionTypeAnnotation } = require('./functionDeclaration');
const config = require('../config');
/**
 * 处理变量声明
 * @param {import('@babel/types').VariableDeclarator[]} declarations
 * @param {String} kind
 * @param {import('@babel/types').Comment[]} leadingComment
 */
function declarationsDeal(declarations, kind, leadingComment) {
  const resultList = [];
  declarations.forEach((oldDeclarator) => {
    const declarator = oldDeclarator;
    const { init, id } = declarator;
    let newType = types.anyTypeAnnotation();
    const newId = types.identifier(id.name);
    if (types.isStringLiteral(init)) {
      newType = types.stringTypeAnnotation();
    }
    if (types.isNumericLiteral(init)) {
      newType = types.numberTypeAnnotation();
    }
    if (types.isBooleanLiteral(init)) {
      newType = types.booleanTypeAnnotation();
    }
    if (types.isArrayExpression(init)) {
      newType = types.arrayTypeAnnotation(types.anyTypeAnnotation());
    }
    if (types.isObjectExpression(init)) {
      newType = types.objectTypeAnnotation(tsObjectPattern(init.properties));
    }
    if (types.isArrowFunctionExpression(init)) {
      newType = getFunctionTypeAnnotation(init.async, init.params, leadingComment);
    }
    newId.typeAnnotation = types.typeAnnotation(newType);
    declarator.id = newId;
    declarator.init = null;
    resultList.push(declarator);
  });
  return resultList;
}

/**
 * 对象属性转成导入语句说明符
 * @param {import('@babel/types').ObjectProperty} objectProperty 对象的属性
 */
function objectProperty2ImportSpecifier(objectProperty) {
  const { value, key } = objectProperty;
  if (types.isObjectPattern(value)) {
    // import语句中无法用结构
    const local = types.identifier(key.name);
    const imported = types.identifier(key.name);
    return types.importSpecifier(local, imported);
  }

  if (types.isIdentifier(value)) {
    const local = types.identifier(key.name);
    const imported = types.identifier(key.name);
    return types.importSpecifier(local, imported);
  }
  return null;
}

/**
 * 导入句处理-从require到import
 * @param {import('@babel/types').LVal} lVal 定义的id
 */
function importSpecifiersDeal(lVal) {
  const specifiers = [];
  if (types.isIdentifier(lVal)) {
    const local = types.identifier(lVal.name);
    specifiers.push(types.importDefaultSpecifier(local));
  }
  if (types.isObjectPattern(lVal)) {
    const { properties } = lVal;
    properties.forEach((prop) => {
      const specifier = objectProperty2ImportSpecifier(prop);
      if (specifier) {
        specifiers.push(specifier);
      }
    });
  }
  return specifiers;
}

function requiredPathSave(router) {
  const { rootPath } = config;
  if (/^[\.\/|\.\.\/]/.test(router)) {
    let src = path.resolve(rootPath, router);
    if (fs.existsSync(`${src}.js`)) {
      src += '.js';
    } else if (fs.existsSync(path.resolve(src, './index.js'))) {
      src = path.resolve(src, './index.js');
    }
    config.scanMap[src] = [];
  }
}

/**
 * 变量定义
 * @param {NodePath} nodePath
 */
function variableDeclaration(nodePath) {
  const { node } = nodePath;
  node.trailingComments = null;
  if (types.isVariableDeclaration(node)) {
    const { kind, declarations, leadingComments } = node;
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
    if (declarations[0] && types.isCallExpression(declarations[0].init) && declarations[0].init.callee.name === 'require') {
      const specifiers = importSpecifiersDeal(declarations[0].id);
      const source = declarations[0].init.arguments[0];
      if (config.deep) {
        requiredPathSave(source.value);
      }
      const newNode = types.importDeclaration(specifiers, source);

      nodePath.replaceWith(newNode);
    } else {
      const newDeclaration = declarationsDeal(declarations, kind, leadingComment);
      const newNode = types.variableDeclaration(kind, newDeclaration);
      newNode.declare = true;
      nodePath.replaceWith(newNode);
      nodePath.skip();
    }
  }
}

module.exports = { variableDeclaration };
