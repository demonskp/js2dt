const types = require('@babel/types');
const { NodePath } = require('@babel/traverse');
const { getFunctionTypeAnnotation, getTsFunctionTypeAnnotation } = require('./functionDeclaration');
const { objectPattern } = require('../temp/objectTemp');

/**
 * 处理父类继承
 * @param {Object} superClass 父类
 */
function extendsDeal(superClass) {
  if (!superClass) return [];
  const { name } = superClass;
  const extend = types.interfaceExtends(types.identifier(name), null);
  return [extend];
}

/**
 *
 * @param {Object} classProperty 类属性对象
 * @param {Object} leadingComment 前置注释
 */
function classProperty2TypeProperty(classProperty, leadingComment) {
  if (types.isNumericLiteral(classProperty)) {
    return types.tsTypeAnnotation(types.tsNumberKeyword());
  }
  if (types.isStringLiteral(classProperty)) {
    return types.tsTypeAnnotation(types.tsStringKeyword());
  }
  if (types.isBooleanLiteral(classProperty)) {
    return types.tsTypeAnnotation(types.tsBooleanKeyword());
  }
  if (types.isArrowFunctionExpression(classProperty)) {
    const { async, params } = classProperty;
    const functionType = types.tsTypeAnnotation(getTsFunctionTypeAnnotation(async, params, leadingComment));
    return functionType;
  }
  if (types.isArrayExpression(classProperty)) {
    return types.tsTypeAnnotation(types.tsArrayType(types.tsAnyKeyword()));
  }
  if (types.isObjectExpression(classProperty)) {
    const objectProperties = objectPattern(classProperty.properties);
    return types.objectTypeAnnotation(objectProperties);
  }
  return types.tsTypeAnnotation(types.tsAnyKeyword());
}

/**
 * 类属性集合转换
 * @param {import('@babel/types').ClassProperty[]} propertyList 类属性集合
 */
function classProperties(propertyList) {
  const properties = [];
  propertyList.forEach((property) => {
    const {
      key, value, variance, leadingComments, computed,
    } = property;
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
    const typeAnnotation = classProperty2TypeProperty(value, leadingComment);
    const typeProperty = types.classProperty(key, null, typeAnnotation, null, computed, property.static);
    typeProperty.leadingComments = leadingComments;
    properties.push(typeProperty);
  });
  return properties;
}

/**
 * 类转换
 * @param {NodePath} path
 */
function classDeclaration(path) {
  const { node } = path;
  node.trailingComments = null;
  const id = types.identifier(node.id.name);
  const { superClass } = node;

  const classBody = classProperties(node.body.body);

  const body = types.classBody(classBody);
  const newNode = types.classDeclaration(id, superClass, body);
  newNode.declare = true;
  path.replaceWith(newNode);
  path.skip();
}

module.exports = { classDeclaration };
