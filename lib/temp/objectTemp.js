const types = require('@babel/types');

/**
 * 对象参数转自定义类型
 * @param {Array<Object>} properties 对象的属性数组
 */
function objectPattern(properties) {
  const members = [];
  properties.forEach((property) => {
    let tsTypeKeyword;
    if (types.isObjectPattern(property.value)) {
      tsTypeKeyword = objectPattern(property.value.properties, property.key.name);
    }
    if (types.isIdentifier(property.value)) {
      tsTypeKeyword = types.tsAnyKeyword();
    }

    const key = types.identifier(property.key.name);
    const memberTypeAnnotation = types.tsTypeAnnotation(tsTypeKeyword);
    const member = types.tsPropertySignature(key, memberTypeAnnotation);
    members.push(member);
  });

  return types.tsTypeLiteral(members);
}

module.exports = { objectPattern };
