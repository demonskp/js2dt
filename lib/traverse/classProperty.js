const types = require('@babel/types');
const { anyIdentifier, identifierCreate } = require('../temp/identifierTemp');
const { objectPattern } = require('../temp/objectTemp');

/**
 * 箭头函数类型
 * @param {Object} node 箭头函数节点
 */
function arrowFunctionType(node) {
  const { params } = node;

  const paramsTypeAnnotions = [];
  let objectIndex = 0;

  params.forEach((param) => {
    if (types.isIdentifier(param)) {
      paramsTypeAnnotions.push(anyIdentifier(param.name));
      return;
    }
    if (types.isObjectPattern(param)) {
      const { properties } = param;
      paramsTypeAnnotions.push(identifierCreate(`params${objectIndex}`, objectPattern(properties)));
      objectIndex += 1;
      return;
    }
    if (types.isRestElement(param)) {
      param.typeAnnotation = types.tsTypeAnnotation(types.tsArrayType(types.tsAnyKeyword()));
      paramsTypeAnnotions.push(param);
    }
  });
  return types.tsFunctionType(null, paramsTypeAnnotions, types.tsTypeAnnotation(types.tsAnyKeyword()));
}

/**
 * 获取数组类型
 * @param {Object} node 数组语句节点
 */
function arrayExpressionType(node) {
  const { elements } = node;
  const typeArray = [];

  elements.forEach((element) => {
    if (types.isNumericLiteral(element)) {
      typeArray.push(types.tsNumberKeyword());
    }
    if (types.isStringLiteral(element)) {
      typeArray.push(types.tsStringKeyword());
    }
    if (types.isBooleanLiteral(element)) {
      typeArray.push(types.tsBooleanKeyword());
    }
    if (types.isNullLiteral(element)) {
      typeArray.push(types.tsNullKeyword());
    }
    if (types.isIdentifier(element)) {
      if (element.name === 'undefined') {
        typeArray.push(types.tsUndefinedKeyword());
      }
    }
    if (types.isObjectExpression(element)) {
      typeArray.push(types.tsObjectKeyword());
    }
    if (types.isArrayExpression(element)) {
      typeArray.push(arrayExpressionType(element));
    }
  });

  return types.tsTupleType(typeArray);
}

/**
 * 类属性遍历
 * @param {Object} path 遍历节点的路径
 */
function classProperty(path) {
  const { node } = path;
  let typeAnnotation;
  if (types.isArrowFunctionExpression(node.value)) {
    typeAnnotation = types.tsTypeAnnotation(arrowFunctionType(node.value));
  }
  if (types.isNumericLiteral(node.value)) {
    typeAnnotation = types.tsTypeAnnotation(types.tsNumberKeyword());
  }
  if (types.isStringLiteral(node.value)) {
    typeAnnotation = types.tsTypeAnnotation(types.tsStringKeyword());
  }
  if (types.isBooleanLiteral(node.value)) {
    typeAnnotation = types.tsTypeAnnotation(types.tsBooleanKeyword());
  }
  if (types.isArrayExpression(node.value)) {
    typeAnnotation = types.tsTypeAnnotation(arrayExpressionType(node.value));
  }
  node.typeAnnotation = typeAnnotation;
  node.value = null;
}

module.exports = classProperty;
