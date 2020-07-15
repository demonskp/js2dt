const types = require('@babel/types');

/**
 * 对象参数转自定义类型
 * @param {Array<Object>} properties 对象的属性数组
 */
function objectPattern(properties) {
  const members = [];
  properties.forEach((property) => {
    let tsTypeKeyword = types.anyTypeAnnotation();
    if (types.isObjectPattern(property.value)) {
      const deepProperties = objectPattern(property.value.properties);
      tsTypeKeyword = types.objectTypeAnnotation(deepProperties, [], [], [], false);
    }
    if (types.isIdentifier(property.value)) {
      tsTypeKeyword = types.anyTypeAnnotation();
    }

    const key = types.identifier(property.key.name);
    const member = types.objectTypeProperty(key, tsTypeKeyword);
    members.push(member);
  });

  return members;
}

/**
 * 对象参数转TS自定义类型
 * @param {import('@babel/types').Property[]} properties 对象的属性数组
 */
function tsObjectPattern(properties) {
  const members = [];
  properties.forEach((property) => {
    let tsTypeKeyword = types.tsAnyKeyword();
    if (types.isObjectPattern(property.value)) {
      const deepMembers = tsObjectPattern(property.value.properties);
      tsTypeKeyword = types.tsTypeLiteral(deepMembers);
    }
    if (types.isIdentifier(property.value)) {
      tsTypeKeyword = types.tsAnyKeyword();
    }

    const key = types.identifier(property.key.name);
    const member = types.tsPropertySignature(key, types.tsTypeAnnotation(tsTypeKeyword));
    members.push(member);
  });

  return members;
}

module.exports = { objectPattern, tsObjectPattern };
