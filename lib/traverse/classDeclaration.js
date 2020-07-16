const types = require('@babel/types');
const { NodePath } = require('@babel/traverse');
const { getTsFunctionTypeAnnotation } = require('./functionDeclaration');
const { tsObjectPattern } = require('../temp/objectTemp');

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
  if (types.isArrowFunctionExpression(classProperty) || types.isClassMethod(classProperty)) {
    const { async, params } = classProperty;
    const functionType = types.tsTypeAnnotation(getTsFunctionTypeAnnotation(async, params, leadingComment));
    return functionType;
  }
  if (types.isArrayExpression(classProperty)) {
    return types.tsTypeAnnotation(types.tsArrayType(types.tsAnyKeyword()));
  }
  if (types.isObjectExpression(classProperty)) {
    const members = tsObjectPattern(classProperty.properties);
    return types.tsTypeAnnotation(types.tsTypeLiteral(members));
  }
  return types.tsTypeAnnotation(types.tsAnyKeyword());
}

/**
 * 类属性集合转换
 * @param {import('@babel/types').ClassProperty[]|import('@babel/types').ClassMethod[]} propertyList 类属性集合
 */
function classProperties(propertyList) {
  const properties = [];
  propertyList.forEach((property) => {
    const {
      key, value, leadingComments, computed,
    } = property;
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;

    const bodyValue = types.isClassMethod(property) ? property : value;
    const typeAnnotation = classProperty2TypeProperty(bodyValue, leadingComment);
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
