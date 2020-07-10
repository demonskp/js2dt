const types = require('@babel/types');

/**
 * 对象参数转自定义类型
 * @param {Array<Object>} properties 对象的属性数组
 */
function tsObjectPattern(properties) {
  const members = [];
  properties.forEach((property) => {
    let tsTypeKeyword = types.anyTypeAnnotation();
    if (types.isObjectPattern(property.value)) {
      const deepProperties = tsObjectPattern(property.value.properties);
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

module.exports = { tsObjectPattern };