const types = require('@babel/types');

/**
 * flow类型转换成ts类型
 * @param {import('@babel/types').FlowType} flowType flow的简单类型
 */
function flowType2tsType(flowType) {
  if (types.isAnyTypeAnnotation(flowType)) {
    return types.tsAnyKeyword();
  }
  if (types.isNumberTypeAnnotation(flowType)) {
    return types.tsNumberKeyword();
  }
  if (types.isStringTypeAnnotation(flowType)) {
    return types.tsStringKeyword();
  }
  if (types.isBooleanTypeAnnotation(flowType)) {
    return types.tsBooleanKeyword();
  }
  if (types.isObjectTypeAnnotation(flowType)) {
    return types.tsObjectKeyword();
  }
  if (types.isArrayTypeAnnotation(flowType)) {
    return types.tsArrayType(flowType2tsType(flowType.elementType));
  }
  if (types.isGenericTypeAnnotation(flowType)) {
    return types.tsTypeReference(flowType.id);
  }
  return types.tsAnyKeyword();
}

module.exports = { flowType2tsType };
