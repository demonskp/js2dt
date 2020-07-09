const types = require('@babel/types');
const { getFunctionTypeAnnotation } = require('./functionDeclaration');
const { tsObjectPattern } = require('../temp/objectTemp');

/**
 * 处理父类继承
 * @param {Object} superClass 父类
 */
function extendsDeal(superClass) {
  if (!superClass) return null;
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
    return types.numberTypeAnnotation();
  }
  if (types.isStringLiteral(classProperty)) {
    return types.stringTypeAnnotation();
  }
  if (types.isBooleanLiteral(classProperty)) {
    return types.booleanTypeAnnotation();
  }
  if (types.isArrowFunctionExpression(classProperty)) {
    const { async, params } = classProperty;
    const functionType = getFunctionTypeAnnotation(async, params, leadingComment);
    return functionType;
  }
  if (types.isArrayExpression(classProperty)) {
    return types.arrayTypeAnnotation(types.anyTypeAnnotation());
  }
  if (types.isObjectExpression(classProperty)) {
    const objectProperties = tsObjectPattern(classProperty.properties);
    return types.objectTypeAnnotation(objectProperties);
  }
  return types.anyTypeAnnotation();
}

/**
 * 类属性集合转换
 * @param {Object[]} propertyList 类属性集合
 */
function classProperties(propertyList) {
  const properties = [];
  propertyList.forEach((property) => {
    const {
      key, value, variance, leadingComments,
    } = property;
    const leadingComment = leadingComments ? leadingComments[leadingComments.length - 1] : null;
    const type = classProperty2TypeProperty(value, leadingComment);
    const typeProperty = types.objectTypeProperty(key, type, variance);
    typeProperty.leadingComments = leadingComments;
    properties.push(typeProperty);
  });
  return properties;
}

function classDeclaration(path) {
  const { node } = path;
  const id = types.identifier(node.id.name);
  const extendsList = extendsDeal(node.superClass);

  const properties = classProperties(node.body.body);
  const classBody = types.objectTypeAnnotation(properties);
  const newNode = types.declareClass(id, null, extendsList, classBody);
  path.replaceWith(newNode);
}

module.exports = { classDeclaration };
